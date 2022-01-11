class LibProvider {
  libs = {
    BTC: {
      lib: require('bitcore-lib'),
      p2p: require('bitcore-p2p')
    },
    VCL: {
      lib: require('bitcore-lib-vcl'),
      p2p: require('bitcore-p2p-vcl')
    },
  };

  register(chain: string, lib: string, p2p: string) {
    this.libs[chain] = { lib: require(lib), p2p: require(p2p) };
  }

  get(chain) {
    return this.libs[chain];
  }
}

export const Libs = new LibProvider();
