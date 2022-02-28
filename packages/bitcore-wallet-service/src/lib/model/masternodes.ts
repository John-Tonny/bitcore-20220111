import _ from 'lodash';

const Uuid = require('uuid');

export interface IMasternode {
  createdOn: number;
  walletId: string;
  txid: string;
  masternodePrivKey: string;
  masternodePubKey: string;
  coin: string;
  network: string;
  address: string;
  payee: string;
  status: string;
  proTxHash: string;
  collateralblock: number;
  lastpaidtime: number;
  lastpaidblock: number;
  owneraddress: string;
  votingaddress: string;
  collateraladdress: string;
  payaddress: string;
  reward: number;
}

export class Masternodes {
  createdOn: number;
  walletId: string;
  txid: string;
  masternodePrivKey: string;
  masternodePubKey: string;
  coin: string;
  network: string;
  address: string;
  payee: string;
  status: string;
  proTxHash?: string;
  collateralblock?: number;
  lastpaidtime?: number;
  lastpaidblock?: number;
  owneraddress: string;
  votingaddress: string;
  collateraladdress?: string;
  reward: number;

  static create(opts) {
    opts = opts || {};

    const x = new Masternodes();

    const now = Date.now();
    x.createdOn = Math.floor(now / 1000);
    x.walletId = opts.walletId;
    x.txid = opts.txid;
    x.address = opts.address;
    x.masternodePrivKey = opts.masternodePrivKey;
    x.masternodePubKey = opts.masternodePubKey;
    x.coin = opts.coin;
    x.network = opts.network;
    x.payee = opts.payee;
    x.status = opts.status;
    x.proTxHash = opts.proTxHash;
    x.collateralblock = opts.collateralblock;
    x.lastpaidtime = opts.lastpaidtime;
    x.lastpaidblock = opts.lastpaidblock;
    x.owneraddress = opts.owneraddress;
    x.votingaddress = opts.votingaddress;
    x.collateraladdress = opts.collateraladdress;
    x.reward = opts.reward;
    return x;
  }

  static fromObj(obj) {
    const x = new Masternodes();

    x.createdOn = obj.createdOn;
    x.walletId = obj.walletId;
    x.txid = obj.txid;
    x.masternodePrivKey = obj.masternodePrivKey;
    x.masternodePubKey = obj.masternodePubKey;
    x.coin = obj.coin;
    x.network = obj.network;
    x.address = obj.address;
    x.payee = obj.payee;
    x.status = obj.status;
    x.proTxHash = obj.proTxHash;
    x.collateralblock = obj.collateralblock;
    x.lastpaidtime = obj.lastpaidtime;
    x.lastpaidblock = obj.lastpaidblock;
    x.owneraddress = obj.owneraddress;
    x.votingaddress =  obj.votingaddress;
    x.collateraladdress = obj.collateraladdress;
    x.reward = obj.reward;
    return x;
  }
}
