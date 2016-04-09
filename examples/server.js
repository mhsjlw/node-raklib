var raknet = require('../');

if(process.argv.length !=4) {
  console.log('Usage: node server.js <host> <port>');
  process.exit(1);
}

var server = raknet.createServer({
  host: process.argv[2],
  port: parseInt(process.argv[3])
});

server.socket.on('listening', function() {
  console.log('listening');
})

server.on('connection', function(client) {
  client.on('login', function() {
    console.log('A client has login');
  });
});
