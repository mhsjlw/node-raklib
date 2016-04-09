var raknet = require('../index');
var parser = raknet.createDeserializer();
var serializer = raknet.createSerializer();

serializer.write({
  name: 'advertise_system',
  params: {
    pingID: 1,
    serverID: 1,
    magic: 0,
    serverName: 'Hello!'
  }
});

serializer.write({
  name: 'data_packet_0',
  params: {
    seqNumber: 12344,
    encapsulatedPackets: [{
      reliability: 3,
      hasSplit: 16,
      length:4,
      identifierACK: 1,
      messageIndex: 1234,
      orderIndex: 1234,
      orderChannel: 10,
      splitCount: 1,
      splitID: 1,
      splitIndex: 1,
      buffer: new Buffer([0x01,0x02,0x03,0x04])
    }]
  }
});

serializer.pipe(parser);

parser.on('error', function(err) {
  console.log(err.stack);
});

parser.on('data', function(chunk) {
  console.log(JSON.stringify(chunk, null, 2));
});
