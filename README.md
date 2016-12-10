raknet [![Build Status](https://img.shields.io/circleci/project/mhsjlw/raknet/master.svg)](https://circleci.com/gh/mhsjlw/raknet)
======

[![NPM version](https://img.shields.io/npm/v/raknet.svg)](http://npmjs.com/package/raknet)
[![Join the chat at https://gitter.im/PrismarineJS/node-minecraft-protocol](https://img.shields.io/badge/gitter-join%20chat-brightgreen.svg)](https://gitter.im/PrismarineJS/node-minecraft-protocol)

> Note: This project is not affiliated with Jenkins Software LLC nor RakNet.

UDP network library that follows the RakNet protocol for Node.js

## API

### createClient(options)

Create a client. options :
* host
* port
* password (optional)
* customPackets (optional)
* customTypes : native protodef types (optional)
* clientID : a long representing the client id, default to `[339844,-1917040252]`
* mtuSize : default to 1492

### createServer(options)

Create a server. options :
* host
* port
* name (optional)
* customPackets (optional)
* customTypes : native protodef types (optional)
* serverID : a long representing the server id, default to `[ 339724, -6627871 ]`

### createSerializer()

Return a raknet packet serializer, see node-protodef doc.

### createDeserializer()

Return a raknet packet serializer, see node-protodef doc.

## Thanks
- [RakLib](https://github.com/PocketMine/RakLib) for some packets to look at
- [RakNet](http://www.jenkinssoftware.com/) for the original protocol
- [rom1504](https://github.com/rom1504)
