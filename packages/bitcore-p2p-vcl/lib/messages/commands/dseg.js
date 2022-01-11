'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib-vcl');
var utils = require('../utils');
var $ = bitcore.util.preconditions;
var _ = bitcore.deps._;
var BufferUtil = bitcore.util.buffer;
var BufferReader = bitcore.encoding.BufferReader;
var BufferWriter = bitcore.encoding.BufferWriter;

/**
 * @param {Transaction=} arg - An instance of Transaction
 * @param {Object} options
 * @extends Message
 * @constructor
 */
function DsegMessage(arg, options) {
  Message.call(this, options);
  this.command = 'dseg';

  if (!arg) {
    arg = {};
  }
  arg = utils.sanitizeOutpoint(arg);
  this.hash = arg.hash;
  this.n = arg.n;
}
inherits(DsegMessage, Message);

DsegMessage.prototype.setPayload = function(payload) {
  var parser = new BufferReader(payload);
  $.checkArgument(!parser.finished(), 'No data received in payload');

  this.hash = parser.read(32);
  this.n = parser.readUInt32LE();
  utils.checkFinished(parser);
};

DsegMessage.prototype.getPayload = function() {
  var bw = new BufferWriter();
  if (!(_.isUndefined(this.hash)) && !(_.isUndefined(this.n))){
    bw.write(this.hash);
    bw.writeUInt32LE(this.n);
  }
  return bw.concat();
};

module.exports = DsegMessage;
