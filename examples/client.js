var raknet = require('../');

if(process.argv.length < 3 || process.argv.length > 5) {
  console.log('Usage: node client.js <host> <port>');
  process.exit(1);
}

var client = raknet.createClient({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  password: 'Rumpelstiltskin'
});

client.on('connected', function() {
  console.info('connected');
});

client.on('login', function() {
  console.log('login');
});

client.on('error', function(err){
  console.log(err);
});
