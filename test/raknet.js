'use strict';

const net = require('net');
const raknet = require('../index');
const os = require('os');

describe('client', function() {
  let server;
  let client;
  let client_closed = false;
  let server_closed = false;
  let client_connected = false;

  before(function(done) {
    server = raknet.createServer({
      host: os.hostname(),
      port: 19132
    });

    server.socket.on('listening', function() {
      done(null);
    });
  });

  after(function(done){
    server.socket.close();
    client.socket.close();

    client.socket.on('close', function() {
      // hope that it closes
    });
    server.socket.on('close', function() {
      done()
    });
  });

  it('can connect', function(done) {
    client = raknet.createClient({
      host: os.hostname(),
      post: 19132
    });

    client.on('connected', function() {
      done();
    });
  });
});
