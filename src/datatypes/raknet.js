var tryCatch = require('protodef').utils.tryCatch;
var addErrorField = require('protodef').utils.addErrorField;

function readMagic(buffer, offset) {
  return {
    value: [0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78],
    size: 16
  }
}

function writeMagic(value, buffer, offset) {
  new Buffer([0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78]).copy(buffer,offset);
  return offset + 16;
}

function readIpAddress(buffer, offset) {
  var address = (~buffer[offset] & 0xff) + '.' + (~buffer[offset + 1] & 0xff) + '.' + (~buffer[offset + 2] & 0xff) + '.' + (~buffer[offset + 3] & 0xff);
  return {
    size: 4,
    value: address
  }
}

function writeIpAddress(value, buffer, offset) {
  var address = value.split('.');

  address.forEach(function(b) {
    buffer[offset] = ~(parseInt(b)) & 0xff;
    offset++;
  });

  return offset;
}

function writeTriad(value, buffer, offset) {
  buffer[offset] = (value >> 16) & 0xFF;
  buffer[offset + 1] = (value >> 8) & 0xFF;
  buffer[offset + 2] = value & 0xFF;
  return offset + 3;
}

function readTriad(buffer, offset) {
  return {
    size: 3,
    value: (buffer[offset] << 16) + (buffer[offset + 1] << 8) + buffer[offset + 2]
  }
}

function writeLTriad(value, buffer, offset) {
  buffer[offset + 2] = (value >> 16) & 0xFF;
  buffer[offset + 1] = (value >> 8) & 0xFF;
  buffer[offset] = value & 0xFF;
  return offset + 3;
}

function readLTriad(buffer, offset) {
  return {
    size: 3,
    value: (buffer[offset + 2] << 16) + (buffer[offset + 1] << 8) + buffer[offset]
  }
}

function readRestBuffer(buffer, offset) {
  return {
    value: buffer.slice(offset),
    size: buffer.length - offset
  };
}

function writeRestBuffer(value, buffer, offset) {
  value.copy(buffer, offset);
  return offset + value.length;
}

function sizeOfRestBuffer(value) {
  return value.length;
}


function readEndOfArray(buffer, offset, typeArgs) {
  var type = typeArgs.type;
  var cursor = offset;
  var elements = [];
  while(cursor < buffer.length) {
    var results = this.read(buffer, cursor, type, {});
    elements.push(results.value);
    cursor += results.size;
  }
  return {
    value: elements,
    size: cursor - offset
  };
}

function writeEndOfArray(value, buffer, offset,typeArgs) {
  var type = typeArgs.type;
  var self = this;
  value.forEach(function(item) {
    offset = self.write(item, buffer, offset, type, {});
  });
  return offset;
}

function sizeOfEndOfArray(value, typeArgs) {
  var type = typeArgs.type;
  var size = 0;
  for(var i = 0; i < value.length; ++i) {
    size += this.sizeOf(value[i], type, {});
  }
  return size;
}

function readToByte(buffer,offset,typeArgs) {
  var results = this.read(buffer, offset, typeArgs.type, {});
  return {
    value: Math.ceil(results.value/8),
    size: results.size
  };
}

function writeToByte(value, buffer,offset,typeArgs) {
  return this.write(value<<3, buffer, offset, typeArgs.type, {});
}

function sizeOfToByte(value, typeArgs) {
  return this.sizeOf(value << 3, typeArgs.type, {});
}

module.exports = {
  'magic': [readMagic, writeMagic, 16],
  'ipAddress': [readIpAddress, writeIpAddress, 4],
  'triad': [readTriad, writeTriad, 3],
  'ltriad': [readLTriad, writeLTriad, 3],
  'restBuffer': [readRestBuffer, writeRestBuffer, sizeOfRestBuffer],
  'endOfArray':[readEndOfArray,writeEndOfArray,sizeOfEndOfArray],
  'toByte':[readToByte,writeToByte,sizeOfToByte]
};
