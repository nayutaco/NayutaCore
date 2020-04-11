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

export async function GetUserPreferences(key) {

  let value = await DefaultPreference.get(key);
  return value;

}

export async function SetUserPreferences(key, value) {
  await DefaultPreference.set(key, value)

  let res = "saved " + key + " : " + value;
  return res;
}

export function GetLNDConf(network, backend, password) {

  var configString = "[Application Options]\n\n";
  configString += "maxbackoff=2s\n"
  configString += "debuglevel=critical\n"

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
    configString += "\n[bitcoind]\n\n"
    configString += "bitcoind.rpchost=localhost\n";
    configString += "bitcoind.rpcpass=password"+password+"\n";
    configString += "bitcoind.rpcuser=bitcoinrpc\n";
    configString += "bitcoind.zmqpubrawblock=tcp://127.0.0.1:28332\n"
    configString += "bitcoind.zmqpubrawtx=tcp://127.0.0.1:28333\n"
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

    /*
        var neutrinoPeer = '104.41.162.211:18333';
    
    
        configString += "neutrino.addpeer=" + neutrinoPeer + "\n";*/
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
export function GetBitcoinConf(network, password) {
  var config = ""
  config += "listen=1\n";
  config += "disablewallet=1\n";

  config += network + "=1\n";

  config += "prune=550\n";
  config += "upnp=0\n";
  config += "blocksonly=1\n";
  config += "rpcpassword="+password+"\n";
  config += "rpcuser=bitcoinrpc\n";
  config += "server=1\n";

  config += "zmqpubrawblock=tcp://127.0.0.1:28332\n"
  config += "zmqpubrawtx=tcp://127.0.0.1:28333\n"


  return config;

}
