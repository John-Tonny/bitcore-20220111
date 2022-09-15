#!/home/john/.nvm/versions/node/v10.5.0/bin/node

// const UpdateNode = require("./updateNode");
const Client = require('bitcore-wallet-client/index').default;
const nodemailer = require("nodemailer");
const sd = require('silly-datetime');
const process = require('child_process');
const async = require('async')
const fs = require('fs')
const request = require('request');

const work_path = "/mnt/ethereum/bitcore/packages/monit/src/";
let rawdata = fs.readFileSync(work_path + 'config.json');
let config = JSON.parse(rawdata);

const file_name = 'status.txt';

const word = 'bone casual observe virus prepare system aunt bamboo horror police vault floor';
const bwsUrl = 'http://127.0.0.1:3232/bws/api';
const bwsUrl1 = config.bitcore_external_host;
const name = config.chain_name;

const explorerUrl = 'http://127.0.0.1:8200/api/VCL/mainnet/block/tip';

// const smtp = "smtp.tom.com";
// var mailFrom = "jlw2020@tom.com";
// const mailFrom = "jlwkk99@tom.com";
// const mailPwd = "jlw9090";
const mailFrom = config.mail_user;
const mailPwd = config.mail_pwd;

console.log(bwsUrl1, name, mailFrom, mailPwd);


const block_delay = 900;

var monitMongodNums = 0;
var monitExplorerNums = 0;

var restartMongodNums = 0;
var restartMonitNums = 0;

function emailTo(email,subject,text,html,callback) {
    var transporter = nodemailer.createTransport({
        host: smtp,
        port: 25,
        auth: {
            user: mailFrom,
            pass: mailPwd //授权码
        }
    });
    var mailOptions = {
        from: mailFrom, // 发送者
        to: email, // 接受者,可以同时发送多个,以逗号隔开
        subject: subject, // 标题
    };
    if(text != undefined)
    {
        mailOptions.text = text;// 文本
    }
    if(html != undefined)
    {
        mailOptions.html = html;// html
    }
    var result = {
        httpCode: 200,
        message: '发送成功!',
    }
    try {
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                result.httpCode = 500;
                result.message = err;
                callback(result);
                return;
            }
            callback(result);
        });
    } catch (err) {
        result.httpCode = 500;
        result.message = err;
        callback(result);
    }
}

function readData(filename) {
  try {
    let data = fs.readFileSync(work_path + filename, 'utf-8');
    return  Number(data);
  }catch(e){
    return 0;
  }
}

function writeData(filename, data) {
  fs.writeFileSync(work_path + filename, data);
}



const getStatus = function (bwsUrl, word, cb) {
  let key = Client.Key.fromMnemonic(word);
  let client = new Client({
    baseUrl: bwsUrl,
    verbose: false,
  });

  let cred = key.createCredentials(null, { coin: 'vcl', network: 'livenet', account: 0, n: 1});
  client.fromObj(cred);

  async.series(
    [
      next => {
        client.openWallet(function(err, result){
          if (err) return cb(err);
          next();
        });
      },
      next => {
        client.getBalance({}, function(err, result){
          if (err) return cb(err);
          next(null, result);
        });
      }
    ],
    (err, result) => {
      if (err) return cb(err);
      return cb(null, result);
    }
  );
}

const getExplorer = function (url, cb) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let block = JSON.parse(body);
      let date = new Date(block.time).getTime() / 1000;
      let currDate = new Date().getTime() / 1000 ;
      console.log("date:", currDate, date);
      if(currDate - date >= block_delay){
        cb('block delay', body);
      }else{
        cb(null, body);
      }
    }
  });
}


function startMonit(){
  getStatus(bwsUrl, word, function(err, result){
    if(err){
      if(err.message.indexOf("MongoError") != -1 && err.message.indexOf("Topology")!= -1){
        monitMongodNums += 1;
        if(monitMongodNums < 3){
          setTimeout(startMonit, 2000);
        }else{
          restartMongod()
        }
      }else{
	console.log("getStatus error:", err);
      }
    }else{
      console.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),"wallet service is good！");
      monitExplorer();
    }
  });
}

function monitExplorer(){
  getExplorer(explorerUrl, function(err, result){
    if(err){
      monitExplorerNums += 1;
      if(monitExplorerNums < 3){
        setTimeout(monitExplorer, 2000);
      }else{
        if(waitNums == 0){
	  waitNums += 1;
      	  writeData(file_name, waitNums);
          restartMonit()
        }else{
	  waitNums += 1;
          if(waitNums>5){
	    waitNums = 0;
	  }
  	  writeData(file_name, waitNums);
	}
      }
    }else{
      console.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),"explorer service is good！");
      writeData(file_name, 0);
    }
  });
}

function restartMongod(){
  process.exec('systemctl restart mongod',function (error, stdout, stderr) {
    if (error) {
      restartMongodNums += 1;
      if(restartMongodNums < 5){
        setTimeout(restartMongod, 2000);
      }else{
        console.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),"mongod restart is bad！");
        emailTo("szlhtao@tom.com", name + " mongod restart fail", bwsUrl1, "", function(result){
          console.log("wallet", sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),result);
        });
      }
    }else{
      console.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),"mongod restart is good！");
      restartMonit();
    }
  });
}

async function restartMonit(){
  // await UpdateNode.updateNode();
  process.exec('monit restart all',function (error, stdout, stderr) {
    if (error) {
      restartMonitNums+= 1;
      if(restartMonitNums < 5){
        setTimeout(restartMonit, 2000);
      }else{
        console.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'), "monit restart  is bad！");
        emailTo("szlhtao@tom.com", name + " monit restart fail", bwsUrl1, "", function(result){
          console.log("wallet", sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),result);
        });
      }
    }else{
      console.log(sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'), "monit restart is good！");
    }
  });
}

var waitNums  = readData(file_name);
startMonit();
