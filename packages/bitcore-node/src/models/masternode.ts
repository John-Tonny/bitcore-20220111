import { LoggifyClass } from '../decorators/Loggify';
// import logger from '../logger';
import { StorageService } from '../services/storage';
import { TransformOptions } from '../types/TransformOptions';
import { BaseModel, MongoBound } from './base';
// import * as _ from "lodash";
// import {EventStorage} from "./events";

export interface IMasternode {
  chain: string;
  network: string;
  txid: string;
  address: string;
  payee: string;
  status: string;
  protocol: number;
  daemonversion: string;
  sentinelversion: string;
  sentinelstate: string;
  lastseen: number;
  activeseconds: number;
  lastpaidtime: number;
  lastpaidblock: number;
  pingretries: number;
  updatetime: Date;
  processed: boolean;
}

@LoggifyClass
export class VclMasternode extends BaseModel<IMasternode> {
  constructor(storage?: StorageService) {
    super('masternode', storage);
  }

  allowedPaging = [];

  async onConnect() {
    this.collection.createIndex({ chain: 1, network: 1, txid: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, payee: 1 }, { background: true });
    this.collection.createIndex({ chain: 1, network: 1, address: 1 }, { background: true });
  }

  async processMasternode(params) {
    let masternodeOp = this.getMasternodeOp(params);
    masternodeOp.updateOne.update.$set;

    await this.collection.bulkWrite([masternodeOp]);
  }

  getMasternodeOp(masternode) {
    const { txid, chain, network } = masternode;
    return {
      updateOne: {
        filter: {
          txid,
          chain,
          network
        },
        update: {
          $set: masternode
        },
        upsert: true
      }
    };
  }

  _apiTransform(masternode: Partial<MongoBound<IMasternode>>, options?: TransformOptions): any {
    const transform = {
      _id: masternode._id,
      chain: masternode.chain,
      network: masternode.network,
      txid: masternode.txid,
      address: masternode.address,
      payee: masternode.payee,
      status: masternode.status,
      protocol: masternode.protocol,
      daemonversion: masternode.daemonversion,
      sentinelversion: masternode.sentinelversion,
      sentinelstate: masternode.sentinelstate,
      lastseen: masternode.lastseen,
      activeseconds: masternode.activeseconds,
      lastpaidtime: masternode.lastpaidtime,
      lastpaidblock: masternode.lastpaidblock,
      pingretries: masternode.pingretries,
      updatetime: masternode.updatetime
    };
    if (options && options.object) {
      return transform;
    }
    return JSON.stringify(transform);
  }
}

export let VclMasternodeStorage = new VclMasternode();
