import { NativeModules } from 'react-native';

import DefaultPreference from 'react-native-default-preference';

var globalInfo = {};
export function CustomLog(message, args = "") {
  console.log(message, args);
}
export function CustomError(message, args = "") {
  console.error(message, args);
}

export function SetGlobalInfo(updatedInfo) {
  globalInfo = updatedInfo;

}

export function GetGlobalInfo() {
  return globalInfo;

}


export function GetNodeFromStartUpData(startUpData) {

  if(startUpData.ipAddress === undefined || startUpData.port === undefined){
    return null;
  }
  
  return startUpData.ipAddress+":"+startUpData.port;

}
export function BTCToFiat(btcAmount, fiatValues) {
  const locale = NativeModules.I18nManager.localeIdentifier;
  console.log("locale is " + locale);
  var currency = "usd";
  if (locale.indexOf("_US") != -1) {
    currency = "usd";
  }
  else if (locale.indexOf("_JP") != -1) {
    currency = "jpy";
  }
  else if (locale.indexOf("_EU") != -1) {
    currency = "eur";
  }
  else if (locale.indexOf("_GB") != -1) {
    currency = "gbp";
  }
  return (btcAmount * fiatValues[currency]).toFixed(2);
}

export function satsToBTC(sats) {
  return sats / 100000000;
}

export async function GetUserPreferences(key, defaultValue) { 
  let value = await DefaultPreference.get(key);
  if(value == undefined){
    return defaultValue;
  }
  return value;

}

export async function SetUserPreferences(key, value) {
  await DefaultPreference.set(key, value)

  let res = "saved " + key + " : " + value;
  return res;
}

export function GetLNDConf(network, backend, password, peers, fixedPeer, tor) {

  var configString = "[Application Options]\n\n";
  configString += "maxbackoff=2s\n"
  configString += "debuglevel=info\n"
 
  //configString += "listen=localhost\n"
  configString += "listen=0.0.0.0:9730\n"//so it doesnt clash with other wallets 
  //configString += "sync-freelist=0\n"
  configString += "rpclisten=127.0.0.1:10009\n"
  configString += "restlisten=127.0.0.1:8080\n"
  configString += "maxlogfiles=3\n"
  configString += "maxlogfilesize=10\n"

  configString += "maxpendingchannels=2\n"
  configString += "\n[Bitcoin]\n\n"
  configString += "bitcoin.active=1\n"


  if (network == "testnet") {
    configString += "bitcoin.testnet=1\n"
  } else {
    configString += "bitcoin.mainnet=1\n"
  }

  configString += "bitcoin.defaultchanconfs=1\n"

  if (backend === "bitcoind") {
    configString += "bitcoin.node=bitcoind\n"
  } else {
    configString += "bitcoin.node=neutrino\n"
  }

  if (backend === "bitcoind") {
    configString += "\n[Bitcoind]\n\n"
    configString += "bitcoind.rpchost=localhost\n";
    configString += "bitcoind.rpcpass="+password+"\n";
    configString += "bitcoind.rpcuser=bitcoinrpc\n";
    configString += "bitcoind.zmqpubrawblock=tcp://127.0.0.1:28332\n"
    configString += "bitcoind.zmqpubrawtx=tcp://127.0.0.1:28333\n"
  }


  if(tor === "true"){
  configString += "\n[Tor]\n\n"
  configString += "tor.active=true\n"
  //configString += "tor.socks=127.0.0.1:9050\n"
  configString += "tor.streamisolation=true\n"
  configString += "tor.v3=true\n"

  }
 

  configString += "\n[Routing]\n\n"
  configString += "routing.assumechanvalid=1\n"

  configString += "\n[Autopilot]\n\n"

  configString += "autopilot.active=0\n"

  configString += "autopilot.allocation=0.95\n"
  configString += "autopilot.minconfs=1\n"
  configString += "autopilot.private=1\n"
  configString += "autopilot.allocation=0.95\n"

  configString += "autopilot.heuristic=externalscore:0.95\n"
  configString += "autopilot.heuristic=preferential:0.05\n"

  configString += "\n[wtclient]\n\n"
  configString += "wtclient.active=1\n"
  configString += "wtclient.sweep-fee-rate=20\n"



  if (backend === "neutrino") {
    configString += "\n[Neutrino]\n\n"
console.log("fixed peer",fixedPeer);
    if( fixedPeer === ""){
    peers.forEach(aPeer=> {
      configString += "neutrino.addpeer=" +aPeer + "\n"; 
    });
  }else{
    configString += "neutrino.connect=" + fixedPeer + "\n"; 
  }
    
       
    if (network === "testnet") {
      var feeUrl = "https://nodes.lightning.computer/fees/v1/btctestnet-fee-estimates.json";
    } else {
      var feeUrl = "https://nodes.lightning.computer/fees/v1/btc-fee-estimates.json";
    }

    configString += "neutrino.feeurl=" + feeUrl + "\n"
  }

  console.log("config string", configString);

  return configString;

}
export function GetBitcoinConf(network, password, maxMemory) {
  var config = ""
  config += "listen=1\n";
  config += "disablewallet=1\n";

  config += network + "=1\n"; 
  config += "prune=550\n";
  config += "upnp=0\n";
  config += "blocksonly=1\n";
  config += "bitcoind.rpchost=localhost\n";
  config += "rpcpassword="+password+"\n";
  config += "rpcuser=bitcoinrpc\n";
  config += "server=1\n";
  config += "maxuploadtarget=0\n";
  console.log("Max memory is",maxMemory);
  
  
  var mem = Math.floor((1902936064 / 1000000) / 2);
 
  config += "dbcache="+mem+"\n"; 
  config += "zmqpubrawblock=tcp://127.0.0.1:28332\n"
  config += "zmqpubrawtx=tcp://127.0.0.1:28333\n"

  console.log(config);
  return config;

}


export function GetTestnetPeers(){
  var peers = [];
  peers.push("203.132.95.10:9735");
  peers.push("50.116.3.223:9734");
  peers.push("3.16.119.191:9735"); 
  peers.push("13.248.222.197:9735");
  peers.push("faucet.lightning.community");  
  return peers; 
}


export function TimeoutPromise(timeout, err, promise) {
  return new Promise(function(resolve,reject) {
    promise.then(resolve,reject);
    setTimeout(reject.bind(null,err), timeout);
  });
}


export function IsJSON(jsonStr) {
  if (/^[\],:{}\s]*$/.test(jsonStr.replace(/\\["\\\/bfnrtu]/g, '@').
    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
    return true;
  }

  return false;
}
 