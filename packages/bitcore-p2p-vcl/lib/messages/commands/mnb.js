'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('bitcore-lib-vcl');
var utils = require('../utils');
var $ = bitcore.util.preconditions;
var _ = bitcore.deps._;
var BufferUtil = bitcore.util.buffer;
var BufferReader = bitcore.encoding.BufferReader;

/**
 * @param {Transaction=} arg - An instance of Transaction
 * @param {Object} options
 * @extends Message
 * @constructor
 */
function MnbroadcastMessage(arg, options) {
  Message.call(this, options);
  this.command = 'mnb';
  $.checkArgument(
      _.isUndefined(arg) || (BufferUtil.isBuffer(arg) && arg.length === 387),
      'First argument is expected to be an 387 byte buffer'
  );
  this.rawTx = arg;
}
inherits(MnbroadcastMessage, Message);

MnbroadcastMessage.prototype.setPayload = function(payload) {
  var parser = new BufferReader(payload);
  this.rawTx = parser.read(387);

  utils.checkFinished(parser);
};

MnbroadcastMessage.prototype.getPayload = function() {
  return this.rawTx;
};

module.exports = MnbroadcastMessage;
