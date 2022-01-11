import * as _ from 'lodash';
import { LoggifyClass } from '../decorators/Loggify';
import logger from '../logger';
import { EventStorage } from '../models/events';
import { IMasternode, VclMasternode, VclMasternodeStorage } from '../models/masternode';
import { ChainStateProvider } from '../providers/chain-state';
import app from '../routes';
import { wait } from '../utils/wait';
import { Config, ConfigService } from './config';
import { Storage, StorageService } from './storage';

@LoggifyClass
export class MasternodeService {
  chain: string;
  network: string;
  configService: ConfigService;
  storageService: StorageService;
  protected masternodeModel: VclMasternode;
  app: typeof app;
  stopped = false;

  constructor({ configService = Config, storageService = Storage, masternodeModel = VclMasternodeStorage } = {}) {
    this.configService = configService;
    this.storageService = storageService;
    this.masternodeModel = masternodeModel;
    this.app = app;
    this.chain = '';
    this.network = '';
    for (let chainNetwork of Config.chainNetworks()) {
      const { chain, network } = chainNetwork;
      if (chain === 'VCL') {
        this.chain = chain;
        this.network = network;
      }
    }
  }

  async start() {
    if (this.configService.isDisabled('masternode')) {
      logger.info('Disabled Masternode Service');
      return;
    }

    if (this.chain !== 'VCL') {
      return;
    }

    logger.info('Starting Masternode Service');
    if (!this.storageService.connected) {
      await this.storageService.start({});
    }

    while (!this.stopped) {
      let imasternodes: Array<any> = [];
      let chain = this.chain;
      let network = this.network;
      let utxo = '';
      let masternodes = await ChainStateProvider.getMasternodeStatus({ chain, network, utxo });
      if (masternodes) {
        _.forEach(_.keys(masternodes), function(key) {
          let imasternode: IMasternode = {
            chain,
            network,
            txid: key,
            address: masternodes[key].address,
            payee: masternodes[key].payee,
            status: masternodes[key].status,
            protocol: masternodes[key].protocol,
            daemonversion: masternodes[key].daemonversion,
            sentinelversion: masternodes[key].sentinelversion,
            sentinelstate: masternodes[key].sentinelstate,
            lastseen: masternodes[key].lastseen,
            activeseconds: masternodes[key].activeseconds,
            lastpaidtime: masternodes[key].lastpaidtime,
            lastpaidblock: masternodes[key].lastpaidblock,
            pingretries: masternodes[key].pingretries,
            updatetime: new Date(Date.now()),
            processed: true
          };
          imasternodes.push(imasternode);
        });
        for (const imasternode of imasternodes) {
          this.processMasternode(imasternode);
        }
        if (imasternodes.length > 0) {
          EventStorage.signalMasternode({ state: 'new', chain, network });
        }
      }
      await wait(5 * 60 * 1000);
    }
  }

  async stop() {
    this.stopped = true;
    await wait(1000);
  }

  async processMasternode(params): Promise<any> {
    await this.masternodeModel.processMasternode(params);
  }
}

// TOOO: choose a place in the config for the API timeout and include it here
export const Masternode = new MasternodeService({});
