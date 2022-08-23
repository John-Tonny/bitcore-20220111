'use strict';

var Message = require('../message');
var inherits = require('util').inherits;
var bitcore = require('vircle-lib');
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
function GovobjvoteMessage(arg, options) {
  Message.call(this, options);
  this.command = 'govobjvote';
  $.checkArgument(
      _.isUndefined(arg) || (BufferUtil.isBuffer(arg) && arg.length === 387),
      'First argument is expected to be an 387 byte buffer'
  );
  this.raw = arg;
}
inherits(GovobjvoteMessage, Message);

GovobjvoteMessage.prototype.setPayload = function(payload) {
  var parser = new BufferReader(payload);
  this.raw = parser.readAll();

  utils.checkFinished(parser);
};

GovobjvoteMessage.prototype.getPayload = function() {
  return this.raw;
};

module.exports = GovobjvoteMessage;
