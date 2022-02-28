'use strict';
const Uuid = require('uuid');

const bls12 = require('@noble/bls12-381');

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

function ProUpServiceTx(inputs, proTxHash, host, port, masternodePrivKey, payAddr, network) {
  if (!(this instanceof ProUpServiceTx)) {
    return new ProUpServiceTx(inputs, proTxHash, host, port, masternodePrivKey, payAddr, network);
  }
  this.version = CURRENT_VERSION;
  this.proTxHash = proTxHash;

  this.inputs = inputs;
  
  this.host = host;
  this.port = port;

  this.masternodePrivKey = masternodePrivKey;
  this.payAddr = payAddr;

  this.network = this.network;
}

ProUpServiceTx.prototype.get_proTxHash = function(writer) {
  if (!writer) {
    writer = new BufferWriter();
  }
  var buf = new Buffer(this.proTxHash, 'hex');
  writer.writeReverse(buf);
  return writer;
}

ProUpServiceTx.prototype.get_inputHash = function(writer) {
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
  console.log("hash:", hash.toString('hex'));
  return writer.write(hash, 32);
}

ProUpServiceTx.prototype.get_ip = function(writer) {
  if (!writer) {
    writer = new BufferWriter();
  }

  writer.write(Buffer.from('00000000000000000000ffff', 'hex'), 12);

  var ip = this.host.split('.');
  ip.forEach(v => ( writer.writeUInt8(v)));

  writer.writeUInt16BE(this.port);
  return writer;
}

ProUpServiceTx.prototype.get_address = function(writer, address, mode) {
  if (!writer) {
    writer = new BufferWriter();
  }

  if(!address){
    writer.writeUInt8(0);
    return writer;
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

ProUpServiceTx.prototype.get_message = function(writer) {
  return  Hash.sha256sha256(writer.toBuffer());  
}

ProUpServiceTx.prototype.get_signMessage = async function(writer, sigMode) {
  if (!writer) {
    writer = new BufferWriter();
  }
  if(!sigMode){
    writer.writeUInt8(0);
    return writer;
  }
  
  var privKey = Buffer.from(this.masternodePrivKey, 'hex');
  var publicKey = bls12.getPublicKey(privKey);
  var msgHash = this.get_message(writer);
  console.log("##########msg:", msgHash);

  try{
    var signature = await bls12.sign(msgHash, privKey);
  
    const isValid = bls12.verify(signature, msgHash, publicKey);
    if(!isValid){
      throw new TypeError('verify is invalid');
    }  
    
    if(signature.length != 96){
      throw new TypeError('singature length is invalid');
    }
  
    writer.write(signature, 96);
 
    console.log("sig:", signature.toString('hex'));
    return writer;
  }catch(error) {
    throw new TypeError('sign is error');
  }
}

ProUpServiceTx.prototype.getScript = async function(sigMode) {
  var writer = new BufferWriter();

  writer.writeUInt16LE(this.version);
  this.get_proTxHash(writer);
  this.get_ip(writer);  
  this.get_address(writer, this.payAddr, true);
  this.get_inputHash(writer);

  await this.get_signMessage(writer, sigMode);

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
}

module.exports = ProUpServiceTx;

