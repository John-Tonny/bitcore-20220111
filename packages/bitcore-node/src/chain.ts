module.exports = {
  BTC: {
    lib: require('bitcore-lib'),
    p2p: require('bitcore-p2p')
  },
  BCH: {
    lib: require('bitcore-lib-cash'),
    p2p: require('bitcore-p2p-cash')
  },
  // john
  VCL: {
    lib: require('bitcore-lib-vcl'),
    p2p: require('bitcore-p2p-vcl')
  }
};
