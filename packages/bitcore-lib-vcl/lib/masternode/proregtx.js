'use strict';

const Uuid = require('uuid');

var $ = require('../util/preconditions');
var errors = require('../errors');
var Base58Check = require('../encoding/base58check');
var Bech32 = require('../encoding/bech32');
var Networks = require('../networks');
var Hash = require('../crypto/hash');
var JSUtil = require('../util/js');
var PrivateKey = require('../privatekey');
var PublicKey = require('../publickey');
var Opcode = require('../opcode');
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var Address = require('../address');
var Signature = require('../crypto/signature');
var Script = require('../script');
var Message = require('../message');

const NETWORK = 'livenet';
const CURRENT_VERSION = 1;

function ProRegTx(inputs, collateralId, collateralIndex, collateralPrivKey,  host, port, masternodePubKey, ownerAddr, voteAddr, payAddr, reward, network) {
  if (!(this instanceof ProRegTx)) {
    return new ProRegTx(inputs, collateralId, collateralIndex, collateralPrivKey,  host, port, masternodePubKey, ownerAddr, voteAddr, payAddr, reward, network);
  }
  this.version = CURRENT_VERSION;
  this.type = 0;
  this.mode = 0

  this.inputs = inputs;
  this.collateralId = collateralId;
  this.collateralIndex = collateralIndex;
  this.collateralPrivKey = collateralPrivKey;

  this.host = host;
  this.port = port;

  this.masternodePubKey = masternodePubKey;
  this.ownerAddr = ownerAddr;
  this.voteAddr = voteAddr;
  this.payAddr = payAddr;

  this.reward = reward || 0;

  this.network = this.network;
}

ProRegTx.prototype.get_collateral = function(writer) {
  if (!writer) {
    writer = new BufferWriter();
  }
  var buf = new Buffer(this.collateralId, 'hex');
  writer.writeReverse(buf);
  writer.writeUInt32LE(this.collateralIndex);
  return writer;
}

ProRegTx.prototype.get_inputHash = function(writer) {
  if (!writer) {
    writer = new BufferWriter();
  }
  var writer1 = new BufferWriter();
  for(var i=0;i<this.inputs.length;i++) {
    var buf = new Buffer(this.inputs[i].txid, 'hex');
    writer1.writeReverse(buf);
    writer1.writeUInt32LE(this.inputs[i].vout);
    var hash = Hash.sha256sha256(writer1.toBuffer());
  }
  return writer.write(hash, 32);
}

ProRegTx.prototype.get_ip = function(writer) {
  if (!writer) {
    writer = new BufferWriter();
  }
  
  writer.write(Buffer.from('00000000000000000000ffff', 'hex'), 12);

  var ip = this.host.split('.');
  ip.forEach(v => ( writer.writeUInt8(v)));

  writer.writeUInt16BE(this.port);
  return writer;
}

ProRegTx.prototype.get_address = function(writer, address, mode) {
  if (!writer) {
    writer = new BufferWriter();
  }

  var addr = new Address(address, this.network || NETWORK);
  if(!addr || !addr.hashBuffer || addr.hashBuffer.length !=20 ){
    throw new TypeError('addr is invalid');
  }
  if(mode){
    writer.write(Buffer.from('160014', 'hex'), 3);
  }
  writer.write(addr.hashBuffer, 20); 
  return writer;
}

ProRegTx.prototype.get_message = function(writer) {
  var reward = this.reward * 100;
  var hash = Hash.sha256sha256(writer.toBuffer()).reverse().toString('hex');
  return this.payAddr + '|' +  reward.toString()  + '|' + this.ownerAddr  + '|' + this.voteAddr + '|' + hash;
}

ProRegTx.prototype.get_signMessage = function(writer, sigMode) {
  if (!writer) {
    writer = new BufferWriter();
  }
  if(!sigMode){
    writer.writeUInt8(0);
    return writer;
  }

  var privKey = PrivateKey.fromWIF(this.collateralPrivKey);
  var msg = this.get_message(writer);
  var message = new Message(msg); 
  var signature = message.sign(privKey, true);
  
  var isValid = message.verify(privKey.toAddress().toString(), signature); 
  if(!isValid){
    throw new TypeError('verify is invalid');
  }

  var buf = new Buffer(signature, 'base64');
  if(!buf || buf.length != 65){
    throw new TypeError('singature is invalid');
  }
  writer.writeUInt8(65);
  writer.write(buf, 65);
 
  return writer;
}

ProRegTx.prototype.getScript = function(sigMode) {
  var writer = new BufferWriter();

  writer.writeUInt16LE(this.version);
  writer.writeUInt16LE(this.type);
  writer.writeUInt16LE(this.mode);
  
  this.get_collateral(writer);
  this.get_ip(writer);
  
  this.get_address(writer, this.ownerAddr);
  writer.write(Buffer.from(this.masternodePubKey, 'hex'), 48);
  this.get_address(writer, this.voteAddr);
  writer.writeUInt16LE(this.reward * 100);
  this.get_address(writer, this.payAddr, true);
  this.get_inputHash(writer);

  this.get_signMessage(writer, sigMode);

  var n = writer.toBuffer().length;
  var writer1 = new BufferWriter();
  writer1.writeUInt8(Opcode.OP_RETURN);
  if (n < 253) {
    writer1.writeUInt8(Opcode.OP_PUSHDATA1);
    writer1.writeUInt8(n);
  } else {
    writer1.writeUInt8(Opcode.OP_PUSHDATA2);
    writer1.writeUInt16LE(n);
  }
  writer1.write(writer.toBuffer(), n);
  return writer1.toBuffer().toString('hex');
  // return "6a4d0f01010000000000a628d72bf56d34149b2764ec24bdaefd744190fabb68ffeae1f14a035d108b6f0100000000000000000000000000ffff6a37b1c12382dc7d61737ec2d1bd1c237a0e2571702ddfbbea9f0163857e14c80a6063daaeb1ce4ca3457fcf2dc04ab8c5d7b5c7235966065ee5b1e1a7713426f9542d0ddd81b0f9e244dc7d61737ec2d1bd1c237a0e2571702ddfbbea9f0000160014218618a385ac4cd893e0ee3c6654dcb14a0453af8d3be309fba3bd4aaa841990c003a93218cbb31085bc5c9cb456e896672bb9c64120a698f6daae40475bca5498463aacc447596d75798dfe46ec059f0c9578ed67736e70db414274731a323586f38520baaa47cbd10bacb21aca1eed1573e5ed7d0a"
}

module.exports = ProRegTx;

