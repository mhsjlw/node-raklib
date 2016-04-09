'use strict';

var Server = require('./server');

function createServer(options) {
  options = options || {};
  var port = options.port != null ?
    options.port :
    options['server-port'] != null ?
      options['server-port'] :
      19132;

  var host = options.host || '0.0.0.0';
  var customPackets = options.customPackets || {};
  var customTypes = options.customTypes || {};

  var server = new Server(customPackets, customTypes);

  server.name = options.name || 'A RakNet Server';

  server.on('connection', function (client) {
    client.on('open_connection_request_1', function(packet) {
      client.write('open_connection_reply_1',{
        magic:0,
        serverID:[ 339724, -6627871 ],
        serverSecurity:0,
        mtuSize:1492
      });
    });

    client.on('open_connection_request_2', function(packet) {
      client.mtuSize = Math.min(Math.abs(packet.mtuSize), 1464);
      client.write('open_connection_reply_2', {
          magic: 0,
          serverID: [ 339724, -6627871 ],
          clientAddress: { version: 4, address: client.address, port: /*client.port*/12345/*TODO fix this*/ },
          mtuSize: packet.mtuSize,
          serverSecurity: 0
        });
    });

    client.on("client_connect",packet => {
      const addresses = [];
      for(let i = 0; i<10; i++) addresses.push({ version: 4, address: server.address, port: server.port });
      client.writeEncapsulated("server_handshake",{
        clientAddress:{ version: 4, address: client.address, port: /*client.port*/12345/*TODO fix this*/ },
        serverSecurity:0,
        systemAddresses:addresses,
        sendPing:[ 0, 73 ],
        sendPong:[ 0, 73 ]
      },{priority: 0})
    });

    client.on('client_handshake', function(packet) {
      client.emit('login');
    });

    client.on('ping', function(packet) {
      client.writeEncapsulated('pong', {
        'pingID': packet.pingID
      })
    });

    client.on('unconnected_ping', function(packet) {
      client.write('unconnected_pong', {
        pingID: packet.pingID,
        serverID: [ 339724, -6627871 ],
        magic: 0,
        serverName: server.name
      });
    });
  });

  server.listen(port, host);
  return server;
}

module.exports = createServer;
