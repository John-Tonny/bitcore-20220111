import * as _ from 'lodash';
// import * as async from 'async';
import { LoggifyClass } from '../decorators/Loggify';
import logger from '../logger';
import app from '../routes';
import { RPC } from '../rpc';
import { wait } from '../utils/wait';
import { Config, ConfigService } from './config';

@LoggifyClass
export class RpcService {
  chain: string;
  network: string;
  configService: ConfigService;
  app: typeof app;
  stopped = false;
  cfgRpcArr = new Array();
  rpcArr = new Array();
  removeArr = new Array();

  constructor({ configService = Config } = {}) {
    this.configService = configService;
    this.app = app;
    this.chain = '';
    this.network = '';
    for (let chainNetwork of Config.chainNetworks()) {
      const { chain, network } = chainNetwork;
      if (chain === 'VCL') {
        this.chain = chain;
        this.network = network;

        if (this.configService.chainConfig({ chain, network })['rpc'] instanceof Array) {
          this.getCfgRpcArray();
        }
      }
    }
  }

  async start() {
    if (this.configService.isDisabled('rpc')) {
      logger.info('Disabled Rpc Service');
      return;
    }

    if (this.chain !== 'VCL') {
      logger.info('Stop Rpc Service');
      return;
    }

    if (this.cfgRpcArr.length < 1) {
      return;
    }

    logger.info('Starting Rpc Service');

    let retrys = 0;
    this.getRpcArray();
    while (!this.stopped) {
      let rets = await this.asyncGetAllBlockHeight(this.rpcArr);
      let maxHeight = 0;
      let index = -1;
      let bValid = false;
      for (let i = 0; i < rets.length; i++) {
        if (rets[i]['err']) {
          this.removeArr.push(rets[i]['host']);
        } else {
          if (rets[i]['data'] > 0) {
            let rpcIndex = app.get('rpcIndex') || 0;
            if (rpcIndex <= this.cfgRpcArr.length - 1) {
              if (this.cfgRpcArr[rpcIndex].getHostAndPort() == rets[i]['host']) {
                bValid = true;
              }
            }
            if (rets[i]['data'] > maxHeight) {
              maxHeight = rets[i]['data'];
              index = i;
            }
          }
        }
      }
      if (index != -1 && bValid == false) {
        let pos = this.findCfgRpc(rets[index]['host']);
        if (pos != -1) {
          app.set('rpcIndex', pos);
        }
      }

      this.removeRpcArray();

      retrys++;
      if (retrys >= 12) {
        retrys = 0;
        this.getRpcArray();
      }
      await wait(5 * 1000);
    }
  }

  getCfgRpcArray() {
    let chain = this.chain;
    let network = this.network;
    let nums = this.configService.chainConfig({ chain, network })['rpc'].length;
    for (let i = 0; i < nums; i++) {
      this.cfgRpcArr[i] = this.getRPC(this.chain, this.network, i);
    }
  }

  getRpcArray() {
    for (let i = 0; i < this.cfgRpcArr.length; i++) {
      this.rpcArr[i] = this.getRPC(this.chain, this.network, i);
    }
  }

  removeRpcArray() {
    for (let i = 0; i < this.removeArr.length; i++) {
      let pos = this.findRpc(this.removeArr[i]);
      if (pos != -1) {
        this.rpcArr.splice(pos, 1);
      }
    }
    this.removeArr.splice(0, this.removeArr.length);

    if (this.rpcArr.length == 0) {
      this.getRpcArray();
    }
  }

  findCfgRpc(hostAndPort: string) {
    for (let i = 0; i < this.cfgRpcArr.length; i++) {
      if (this.cfgRpcArr[i].getHostAndPort() == hostAndPort) {
        return i;
      }
    }
    return -1;
  }

  findRpc(hostAndPort: string) {
    for (let i = 0; i < this.rpcArr.length; i++) {
      if (this.rpcArr[i].getHostAndPort() == hostAndPort) {
        return i;
      }
    }
    return -1;
  }

  isRemoveArr(index) {
    if (this.removeArr.length == 0) {
      return false;
    }
    for (let i = 0; i < this.removeArr.length; i++) {
      if (this.removeArr[i] == index) {
        return true;
      }
    }
    return false;
  }

  async asyncGetAllBlockHeight(rpcArr) {
    const unresolvedPromises = rpcArr.map(rpc => this.getBlockHeight(rpc));
    return await Promise.all(unresolvedPromises);
  }

  async getBlockHeight(rpc: RPC) {
    let resp = { err: null };
    resp['host'] = rpc.getHostAndPort();
    try {
      resp['data'] = await rpc.getBlockHeight();
    } catch (e) {
      resp['err'] = e;
    }
    return resp;
  }

  async stop() {
    this.stopped = true;
    await wait(1000);
  }

  getRPC(chain: string, network: string, index) {
    const RPC_PEER = Config.get().chains[chain][network].rpc[index];
    if (!RPC_PEER) {
      throw new Error(`RPC not configured for ${chain} ${network}`);
    }
    const { username, password, host, port } = RPC_PEER;
    return new RPC(username, password, host, port);
  }
}

// TOOO: choose a place in the config for the API timeout and include it here
export const RpcSrv = new RpcService({});
