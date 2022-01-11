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
