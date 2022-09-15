const fs = require('fs');
const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const P2p = require('bitcore-p2p')
const Peer = P2p.Peer;

const username = 'chain';
const password = '999000';

let rawdata = fs.readFileSync('config.json');
let config = JSON.parse(rawdata);

var p2p_hosts = config.p2p_hosts;
var p2p_port = config.p2p_port;
var p2p_states = {}

var rpc_hosts = config.rpc_hosts;
var rpc_port = config.rpc_port;
var rpc_states = {}

var config_filename = config.config_filename;

var dbUrl = `mongodb://${config.db_url}:${config.db_port}`;
if(config.db_user == undefined ||  config.db_user != ""){
  dbUrl = `mongodb://${config.db_user}:${config.db_password}@${config.db_url}:${config.db_port}`;
}

async function getBestBlockHeight(url) {
  let client = await MongoClient.connect(url);
  let db = client.db('bitcore');
  let table = db.collection('blocks');
  let res = await table.find({}).sort({'height': -1}).limit(1);
  let result = await res.toArray()
  let height = -1;
  if(result.length>0){
    height = result[0].height;
  }
  return height;
}

function callMethod(rpc_host, method, params, callback) {
  return new Promise(function(resolve,reject){
    request(
      {
        method: 'POST',
        url: `http://${username}:${password}@${rpc_host}:${rpc_port}`,
        body: {
          jsonrpc: '1.0',
          id: Date.now(),
          method,
          params
        },
        json: true
      },
      (err, res) => {
        if (err) {
          reject(err);
        } else if (res) {
          if (res.body) {
            if (res.body.error) {
              reject(res.body.error);
            } else if (res.body.result) {
              resolve(res.body && res.body.result);
            } else {
              reject({ msg: 'No error or body found', body: res.body });
            }
          } else {
            reject({ msg: 'body not found'});
          }
        } else {
          reject('No response or error returned by rpc call');
        }
      }
    );
  });
}

async function getCurrentBlockHeight(rpc_host) {
  return await callMethod(rpc_host, 'getblockcount', []);
}

function getPeerState(p2p_host, height) {
  let peer = new Peer({host: p2p_host, port: p2p_port});
  
  peer.connect();

  peer.once('ready', function() {
    // peer info
    // console.log(peer.version, peer.subversion, peer.bestHeight);
    if(peer.bestHeight>= height) {
      p2p_states[p2p_host].state = true;
      p2p_states[p2p_host].time = new Date().getTime() - p2p_states[p2p_host].time   
      p2p_states[p2p_host].height = peer.bestHeight;
    }
    peer.disconnect();
  });

  
  peer.once('disconnect', function() {
    peer.removeAllListeners();
  });

  peer.once('connect', function() {
  });  

  peer.once('error', function(ret) {
    p2p_states[p2p_host].state = false;
    p2p_states[p2p_host].time = -1;      
    p2p_states[p2p_host].height = -1;      
    peer.removeAllListeners()
  });  
}

async function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function getStates(){
  let height = -1;
  try{
    height = await getBestBlockHeight(dbUrl)

    for(i in p2p_hosts) {
      p2p_states[p2p_hosts[i]] = {"state": false, "time": new Date().getTime(), "height": -1};
      getPeerState(p2p_hosts[i], height);
    }
  }catch(e){
    console.log("mongo err:", e);	
  }

  for(i in rpc_hosts) {
    rpc_states[rpc_hosts[i]] = {"state": false, "time": new Date().getTime(), "height": -1};
    try {
      let currentHeight = await getCurrentBlockHeight(rpc_hosts[i])
      rpc_states[rpc_hosts[i]].state = true;
      rpc_states[rpc_hosts[i]].time = new Date().getTime() - rpc_states[rpc_hosts[i]].time   
      rpc_states[rpc_hosts[i]].height = currentHeight;
    }catch (e) {
      rpc_states[rpc_hosts[i]].state = false;
      rpc_states[rpc_hosts[i]].time = new Date().getTime() - rpc_states[rpc_hosts[i]].time   
      rpc_states[rpc_hosts[i]].height = -1;
    }
  }

  if(height != -1){
    await wait(3000);
  }

  return {p2p_states, rpc_states};
}


async function updateNode(){
  let states = await getStates();

  let bestHeight = 0;
  let p2pHost = "";
  for(host in states["p2p_states"]){
    if(states["p2p_states"][host].state == true){
      if(states["p2p_states"][host].height > bestHeight){
	p2pHost = host;
	bestHeight = states["p2p_states"][host].height;
      }
    }
  }

  let currentHeight = 0;
  let rpcHost = "";
  for(host in states["rpc_states"]){
    if(states["rpc_states"][host].state == true){
      if(states["rpc_states"][host].height > currentHeight){
	rpcHost = host;
	currentHeight = states["rpc_states"][host].height;
      }
    }
  }

  await updateConfig(p2pHost, rpcHost);

  process.exit(0);
}

async function updateConfig(p2pHost, rpcHost){
  let rawdata = fs.readFileSync(config_filename);
  let config = JSON.parse(rawdata);
  if(p2pHost != ""){
    config.bitcoreNode.chains.VCL.mainnet.trustedPeers[0].host = p2pHost;
  }
  if(rpcHost != ""){
    config.bitcoreNode.chains.VCL.mainnet.rpc.host = rpcHost;
  }

  let new_data=JSON.stringify(config);  //将json对象转化为字符处才能存储进去
  fs.writeFileSync(config_filename + ".test", new_data);
}


exports.updateNode = updateNode;


