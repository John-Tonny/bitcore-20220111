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
function GovsyncMessage(arg, options) {
  Message.call(this, options);
  this.command = 'govsync';
  $.checkArgument(
      _.isUndefined(arg) || (BufferUtil.isBuffer(arg) && arg.length === 387),
      'First argument is expected to be an 387 byte buffer'
  );
  this.raw = arg;
}
inherits(GovsyncMessage, Message);

GovsyncMessage.prototype.setPayload = function(payload) {
  var parser = new BufferReader(payload);
  this.raw = parser.readAll();

  utils.checkFinished(parser);
};

GovsyncMessage.prototype.getPayload = function() {
  return this.raw;
};

module.exports = GovsyncMessage;
