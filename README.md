RakNet [![NPM version](https://img.shields.io/npm/v/raknet.svg)](http://npmjs.com/package/raknet) [![Join the chat at https://gitter.im/PrismarineJS/node-minecraft-protocol](https://img.shields.io/badge/gitter-join%20chat-brightgreen.svg)](https://gitter.im/PrismarineJS/node-minecraft-protocol)
======

> Note: This project is not affiliated with Jenkins Software LLC nor RakNet.

RakNet implementation in JavaScript for Node

## API

### `createClient(options)`

Create a client. Options:
* `host`
* `port`
* `password` (optional)
* `customPackets` (optional)
* `customTypes`, native protodef types (optional)
* `clientID`, a long representing the client ID, default to `[339844,-1917040252]`
* `mtuSize`, default to 1492

### `createServer(options)`

Create a server. Options:
* `host`
* `port`
* `name` (optional)
* `customPackets` (optional)
* `customTypes`, native protodef types (optional)
* `serverID`, a long representing the server id, default to `[ 339724, -6627871 ]`

### `createSerializer()`

Return a RakNet packet serializer, see node-protodef documentation

### `createDeserializer()`

Return a RakNet packet serializer, see node-protodef documentation

## Thanks
- [RakLib](https://github.com/PocketMine/RakLib) for some packets to look at
- [RakNet](http://www.jenkinssoftware.com/) for the original protocol
- [rom1504](https://github.com/rom1504)
