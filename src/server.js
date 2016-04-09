'use strict';

const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;
const debug = require('debug')('raknet');
const Client = require('./client');

class Server extends EventEmitter {
  constructor(customPackets, customTypes) {
    super();
    this.ipPortToClient = {};
    this.customPackets = customPackets || {};
    this.customTypes = customTypes || {};
  }

  listen(port,address) {
    this.address = address;
    this.port = port;
    this.socket = dgram.createSocket({type: 'udp4'});
    this.socket.bind(this.port, this.address);

    this.socket.on('message', function(data,rinfo) {
      const ipPort = rinfo.address + ':' + rinfo.port;
      let client;
      if(!this.ipPortToClient[ipPort]) {
        client = new Client(rinfo.port, rinfo.address, this.customPackets, this.customTypes);
        client.setSocket(this.socket);
        this.ipPortToClient[ipPort] = client;
        this.emit('connection', client);
      }
      else {
        client = this.ipPortToClient[ipPort];
      }
      client.handleMessage(data);
    });
  }
}

module.exports = Server;
