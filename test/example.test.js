const net = require('net');
const raknet = require('../index');
const os = require('os');

const PORT = 19132 || process.env.PORT;

describe('client', () => {
  let server;
  let client;

  beforeAll(() => {
    return new Promise((resolve, reject) => {
      server = raknet.createServer({
        host: os.hostname(),
        port: PORT
      });

      server.socket.on('listening', () => {
        resolve();
      });
    });
  });

  test('can connect', () => {
    return new Promise((resolve, reject) => {
      client = raknet.createClient({
        host: os.hostname(),
        post: PORT
      });

      client.on('connected', () => {
        resolve();
      });
    });
  })

  afterAll(() => {
    return new Promise((resolve, reject) => {
      server.socket.close();
      client.socket.close();

      client.socket.on('close', function() {
        server.socket.on('close', function() {
          resolve();
        });
      });
    });
  });
});
