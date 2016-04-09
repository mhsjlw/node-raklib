'use strict';

var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('raknet');

var createSerializer = require('./transforms/serializer').createSerializer;
var createDeserializer = require('./transforms/serializer').createDeserializer;
var ProtoDef = require('protodef').ProtoDef;
var split = require('split-buffer');
var Serializer = require('protodef').Serializer;
var Parser = require('protodef').Parser;
const merge = require('lodash.merge');

class Client extends EventEmitter {
  constructor(port, address, customPackets, customTypes) {
    super();
    customPackets = customPackets||{};
    customTypes = customTypes||{};
    this.address = address;
    this.port = port;
    this.parser = createDeserializer(true);
    this.serializer = createSerializer(true);
    var proto = new ProtoDef();
    proto.addTypes(require('./datatypes/raknet'));
    proto.addTypes(customTypes);
    proto.addTypes(merge(require('../data/protocol.json'),customPackets).types);
    this.encapsulatedPacketParser=new Parser(proto, 'encapsulated_packet');
    this.encapsulatedPacketSerializer=new Serializer(proto, 'encapsulated_packet');
    this.sendSeqNumber=0;
    this.messageIndex=0;
    this.splitId=0;
    this.mtuSize=548;
    this.splitPackets=[];
    this.channelIndex={0:0};
    this.setErrorHandling();
  }

  setErrorHandling() {
    this.serializer.on('error', function(e) {
      let parts;
      if(e.field) {
        parts = e.field.split('.');
        parts.shift();
      }
      else {
        parts = [];
      }

      e.field = parts.join('.');
      e.message = `Serialization error for ${e.field}: ${e.message}`;
      this.emit('error', e);
    });


    this.parser.on('error', function(e) {
      let parts;
      if(e.field) {
        parts = e.field.split('.');
        parts.shift();
      }
      else {
        parts = [];
      }

      e.field = parts.join('.');
      e.message = `Deserialization error for ${e.field}: ${e.message}`;
      this.emit('error', e);
    });
  }

  emitPacket(parsed) {
    parsed.metadata.name = parsed.data.name;
    parsed.data = parsed.data.params;
    debug('read packet ' + parsed.metadata.name);
    debug(JSON.stringify(parsed.data));
    this.emit('packet', parsed.data, parsed.metadata);
    this.emit(parsed.metadata.name, parsed.data, parsed.metadata);
    this.emit('raw.' + parsed.metadata.name, parsed.buffer, parsed.metadata);
    this.emit('raw', parsed.buffer, parsed.metadata);
  }


  setSocket(socket) {
    this.socket = socket;
    this.serializer.on('data', function(chunk) {
      socket.send(chunk, 0, chunk.length, this.port, this.address);
    });

    this.parser.on('data', function(parsed) {
      this.emitPacket(parsed);
      if(parsed.metadata.name.substr(0, 11) == 'data_packet') {
        const encapsulatedPackets = parsed.data.encapsulatedPackets;
        encapsulatedPackets.forEach(function(encapsulatedPacket) {
          if(encapsulatedPacket.hasSplit) {
            if (!this.splitPackets[encapsulatedPacket.splitID])
              this.splitPackets[encapsulatedPacket.splitID] = [];
            this.splitPackets[encapsulatedPacket.splitID][encapsulatedPacket.splitIndex] = encapsulatedPacket.buffer;

            if (encapsulatedPacket.splitCount == this.splitPackets[encapsulatedPacket.splitID].length) {
              let buffer = this.splitPackets[encapsulatedPacket.splitID].reduce((acc, bufferPart) => Buffer.concat([acc, bufferPart]), new Buffer(0));
              delete this.splitPackets[encapsulatedPacket.splitID];
              this.readEncapsulatedPacket(buffer);
            }
          }
          else
            this.readEncapsulatedPacket(encapsulatedPacket.buffer);
        });
        this.write('ack', {'packets': [{'one': 1,'values': parsed.data.seqNumber}]})
      }
    });
  }

  readEncapsulatedPacket(buffer) {
    try {
      debug('handle encapsulated', buffer);
      var r = this.encapsulatedPacketParser.parsePacketBuffer(buffer);
      this.emitPacket(r);
    }
    catch(err) {
      console.log('encapsulated error', err.stack);
      debug('customPacket', buffer);
      this.emit('customPacket', buffer);
    }
  }

  write(name, params) {
    if(this.ended)
      return;

    debug("writing packet " + name);
    debug(JSON.stringify(params));
    this.serializer.write({ name, params });
  }

  writeEncapsulated(name, params,options) {
    options = options || {};
    let  priority=options.priority||4;
    let reliability=options.reliability||3;
    let orderChannel=options.orderChannel||0;
    const buffer=this.encapsulatedPacketSerializer.createPacketBuffer({ name, params });

    let messageIndex;
    let orderIndex;
    if([2,3,4,6,7].indexOf(reliability)!=-1) {
      messageIndex=this.messageIndex++;
      if(reliability==3)
        orderIndex=this.channelIndex[orderChannel]++;
    }

    if(buffer.length>this.mtuSize-20) {
      const buffers = split(buffer, this.mtuSize-34);
    }

    debug('writing packet ' + name);
    debug(params);
    this.serializer.write({ name, params });
  }

  writeEncapsulated(name, params, priority) {
    priority=priority || 4;
    const buffer = this.encapsulatedPacketSerializer.createPacketBuffer({ name, params });

    if(buffer.length > this.mtuSize) {
      const buffers = split(buffer, this.mtuSize);

      buffers.forEach(function(bufferPart, index) {
        this.write('data_packet_' + priority, {
          seqNumber: this.sendSeqNumber,
          encapsulatedPackets: [{
            reliability: reliability,
            hasSplit: 16,
            messageIndex: index==0 ? messageIndex : this.messageIndex,
            orderIndex: orderIndex,
            orderChannel: orderChannel,
            splitCount: buffers.length,
            splitID: this.splitId,
            splitIndex: index,
            buffer: bufferPart
          }]
        });

        debug("writing packet " + name);
        debug(JSON.stringify(params));

        this.sendSeqNumber++;
        if(index>0) {
          this.messageIndex++;
        }
      });
      this.splitId++;
      this.splitId = this.splitId % 65536;
    }
    else {
      this.write('data_packet_' + priority, {
        seqNumber: this.sendSeqNumber,
        encapsulatedPackets: [{
          reliability: 2,
          hasSplit: 0,
          messageIndex: messageIndex,
          buffer: buffer
        }]
      });

      debug("writing packet " + name);
      debug(JSON.stringify(params));

      this.sendSeqNumber++;
    }
  }

  handleMessage(data) {
    debug('handle',data);
    this.parser.write(data);
  }
}


module.exports = Client;
