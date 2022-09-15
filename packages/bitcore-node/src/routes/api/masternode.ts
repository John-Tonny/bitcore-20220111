import { Router } from 'express';
import * as _ from 'lodash';
import logger from '../../logger';
import { ChainStateProvider } from '../../providers/chain-state';

const router = Router({ mergeParams: true });

router.get('/status', async (req, res) => {
  let { chain, network } = req.params;
  let { txid, address, payee } = req.query;

  if (!chain || !network) {
    return res.status(400).send('Missing required param');
  }

  chain = chain.toUpperCase();
  network = network.toLowerCase();
  try {
    let utxo = '';
    let ret;
    let infos = await ChainStateProvider.getMasternodeStatus({ chain, network, utxo });
    var infos_sort = _.sortBy(infos, function(item) {
      // john
      return -item.lastpaidtime;
    });
    if (typeof txid !== 'undefined') {
      _.forEach(_.keys(infos), function(key) {
        if (key == txid) {
          ret = infos[key];
          ret.txid = key;
          return;
        }
      });
    } else if (typeof payee !== 'undefined') {
      let key = _.findKey(infos_sort, ['payee', payee]);
      if (typeof key != 'undefined') {
        ret = infos_sort[key];
      }
    } else if (typeof address != 'undefined') {
      let key = _.findKey(infos_sort, ['address', address]);
      if (typeof key !== 'undefined') {
        ret = infos_sort[key];
      }
    } else {
      ret = infos;
    }
    if (typeof ret !== 'undefined') {
      return res.send(ret);
    } else {
      return res.send('');
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post('/send', async function(req, res) {
  try {
    let { chain, network } = req.params;
    let { rawTx } = req.body;
    chain = chain.toUpperCase();
    network = network.toLowerCase();
    let ret = await ChainStateProvider.broadcastMasternode({
      chain,
      network,
      rawTx
    });
    return res.send(ret);
  } catch (err) {
    logger.error(err);
    return res.status(500).send(err.message);
  }
});

router.get('/blsgenerate', async (req, res) => {
  try {
    let { chain, network } = req.params;
    let ret = await ChainStateProvider.getMasternodeBlsGenerate({ chain, network });
    return res.send(ret);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/blssign', async (req, res) => {
  try {
    let { chain, network } = req.params;
    let { msgHash, masternodePrivateKey } = req.query;
    let ret = await ChainStateProvider.getMasternodeBlsSign({ chain, network, msgHash, masternodePrivateKey });
    return res.send(ret);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/blsfromsecret', async (req, res) => {
  try {
    let { chain, network } = req.params;
    let { masternodePrivateKey } = req.query;
    let ret = await ChainStateProvider.getMasternodeBlsFromSecret({ chain, network, masternodePrivateKey });
    return res.send(ret);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = {
  router,
  path: '/masternode'
};
