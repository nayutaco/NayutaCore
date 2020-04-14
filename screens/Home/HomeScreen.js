import React, { Component } from 'react';
import { Divider, Tooltip, Text } from 'react-native-elements';
import styles from './HomeScreenStyles';
import { generateSecureRandom } from 'react-native-securerandom';
import * as Keychain from 'react-native-keychain';
import { encrypt } from 'react-native-simple-encryption';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { SetGlobalInfo, GetGlobalInfo, BTCToFiat, satsToBTC, CustomLog, CustomError, GetBitcoinConf, GetLNDConf, SetUserPreferences, GetUserPreferences } from '../../tools/utils';

import {
  NativeEventEmitter,
  StyleSheet,
  Image,
  NativeModules,
  Dimensions,
  View,
  Animated,
  SafeAreaView
} from 'react-native';

const onionOff = require('../../assets/images/onionOff.png');
const onionOn = require('../../assets/images/onion.png');
const lightningOff = require('../../assets/images/boltOff.png');
const lightningOn = require('../../assets/images/bolt.png');
const bitcoindOff = require('../../assets/images/btcOff.png');
const bitcoindOn = require('../../assets/images/btc.png');
const cardHeight = 250;
const cardTitle = 200;
const cardPadding = 60;
const cards = [
  {
    name: "On Chain Wallet",
    color: AppStyles.color.appBlack,
    altColor: AppStyles.color.appGray,
    amount: "0",
    unconf: "",
    fiat: "0",
  },
  {
    name: "Lightning Wallet",
    color: AppStyles.color.appGray,
    altColor: AppStyles.color.appBlack,
    amount: "0",
    fiat: "0",
  }
];


const lndMobileWrapperModule = NativeModules.LNDMobileWrapper;
const androidCoreWrapperModule = NativeModules.AndroidCoreWrapper;

class HomeScreen extends Component {
  state = {
    backend: "neutrino",
    neutrinoSynced: false,
    password: "password",
    restURL: "https://127.0.0.1:8080",
    network: "mainnet",
    bitcoinDStarted: false,
    bitcoinDTorDownloaded: false,
    hiddenServiceStarted: false,
    onionImage: onionOff,
    lightningImage: lightningOff,
    bitcoindImage: bitcoindOff,
    y: new Animated.Value(0),
    showStartView: true,
    showStatus: false,
    statusText: "",
    syncText: "",
    startUpData: {},
    syncProgress: 0,
    headers: 0,
    showProgress: true,
    topStatusText: "",
    progressSize: Dimensions.get('window').width * 0.8
  }
  constructor(props) {
    super(props);
  }



  bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
      var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      hex.push((current >>> 4).toString(16));
      hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
  }
  async savePassword(password) {

    const username = 'password';

    // Store the credentials
    await Keychain.setGenericPassword(username, password);


    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        CustomLog(
          'Credentials successfully loaded for user ' + credentials.username + " " + credentials.password
        );

        return new Promise(resolve => {
          resolve(true)
        });
      } else {
        console.log('No credentials stored');
        return new Promise(reject => {
          reject(false)
        });
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
      return new Promise(reject => {
        reject(false)
      });
    }


  }


  async getPassword() {


    try {
      // Retrieve the credentials 
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        CustomLog(
          'Credentials successfully loaded for user ' + credentials.username + " " + credentials.password
        );

        return new Promise(resolve => {
          resolve(credentials.password)
        });

      } else {
        console.log('No credentials stored');

        return new Promise(reject => {
          reject(null)
        });
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
      return new Promise(reject => {
        reject("error")
      });
    }



  }

  async componentDidMount() {
    //let network = "testnet"
    //let password = "password"
    //androidCoreWrapperModule.setUp(GetBitcoinConf(network,password))
    //androidCoreWrapperModule.startCore(true);
   // var that = this;
   



    await this.startProcess();


  }

  async startProcess() {
    var that = this;
    var password = await that.getPassword();

    if (password === "error") {
      alert("unable to use keychain");
      throw "unable to use keychain"
    }
    if (password === undefined || password === null) {

      let randomBytes = await generateSecureRandom(12);
      CustomLog("Random bytes", randomBytes);

      password = that.bytesToHex(randomBytes);

      let saved = await that.savePassword(password);

      if (saved) {

        console.log("password create", password)

        that.setState({ password: password })
        await that.getBackend();


      } else {
        throw "keychain error!"
      }

    } else {
      console.log("password unlock", password)
      that.setState({ password: password })
      await that.getBackend();
    }


  }

  async getBackend() {
    var that = this;

    let backend = await GetUserPreferences("backend");

    if (backend != undefined || backend != null) {
      that.setState({ backend: backend })
    }
    console.log("backend ", that.state.backend);
   /* setInterval(function(){
      that.setState({syncProgress:that.state.syncProgress+1})

      if(that.state.syncProgress == 2){
       
       
      }
  },5000);*/
 
     await that.loadServices();



  }

  async loadServices() {

    const { network, password } = this.state;
    var that = this;

    this.setState({ statusText: "starting up...", showSyncProgress: false, showStatus: true, topStatusText: "getting start up info..." })

    var baseUrl = "https://wallet.nayuta.co/wallet/api/v1/";
    if(network === "testnet"){
      baseUrl =  "https://shop.nayuta.co/wallet/api/v1/"
    }
    const response = await fetch(baseUrl+"nodeinfo");
    const responseJson = await response.json();
    CustomLog("res", responseJson);
    this.setState({ startUpData: responseJson });
    
    let fromJavaCode = await lndMobileWrapperModule.checkIfWalletExists(network);
    console.log("wallet exists", fromJavaCode);
    let res = JSON.parse(fromJavaCode);
   
   let startRes = await that.startLND()
    console.log("start res", startRes);

    if (res.exists) {
      that.setState({ topStatusText: "unlocking wallet..." })
      await that.unlockLNDWallet();
    } else {
      that.setState({ topStatusText: "creating wallet..." })
      await that.createNewLNDWallet();
    } 
 
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    CustomLog("did mount");

    eventEmitter.addListener('event', (event) => {

      CustomLog("eventy", event)
      try {
        var jsonData = JSON.parse(event.data);
        CustomLog("eventJSON", jsonData)
        if (jsonData.error == true) {
          that.setState({ bitcoindImage: bitcoindOff, bitcoinDStarted: false })
          if (jsonData.response == "rpc") {

          } else {
            alert(jsonData.response);
          }
        } else {

          if (jsonData.response === "downloaded") {

            that.setState({ bitcoinDTorDownloaded: true })

          }
          else if (jsonData.response === "download") {

          }
          else if (jsonData.response == "already started") {


          }
          else if (jsonData.response == "hidden service started") {


            that.setState({ onionImage: onionOn, topStatusText: "" });

          }
          else if (jsonData.response == "hidden service error") {
            that.setState({ onionImage: onionOff, hiddenServiceStarted: false })

          }
          else if (jsonData.response == "starting") {

            that.setState({ bitcoindImage: bitcoindOn, bitcoinDStarted: true })
            setTimeout(function () {
              that.getBlockchainInfo();
            }, 1000);

          }
          else if (jsonData.response == "rpc") {
            setTimeout(function () {
              that.getBlockchainInfo();
            }, 3000);

            var response = JSON.parse(jsonData.res);
            if (response.blocks == 0) {
              var headersMax = that.state.startUpData.blockHeight;
              CustomLog("headersMax ", headersMax);
              var statusTextTop =
                "1/2: " +
                "downloading headers" +
                "\n" +
                response.headers +
                "/" +
                headersMax;

              var val = Math.floor((response.headers / headersMax) * 100);
              CustomLog("val ", val);


              that.setState({ topStatusText: statusTextTop });

            } else {
              var res = this.formatSyncData(
                parseFloat(response.verificationprogress + "") * 100,
                response.blocks,
                that.state.startUpData.blockHeight
              );
              if (res.synced) {

                that.setState({ topStatusText: "blockchain synced" });

              } else {
                var statusTextTop = res.status + " " + res.description;


                that.setState({ topStatusText: statusTextTop });
              }
            }

          }
        }
      } catch (e) {
        CustomError(e);
      }
    });

    androidCoreWrapperModule.setUp(GetBitcoinConf(network,password))

    androidCoreWrapperModule.checkIfDownloaded((fromJavaCode) => {
      if (fromJavaCode == false) {

        CustomLog("not downloaded", fromJavaCode)

        that.setState({ topStatusText: "downloading bitcoind and tor..." });
        androidCoreWrapperModule.startDownload();
      } else {

        CustomLog("is downloaded", fromJavaCode)
        that.setState({ bitcoinDTorDownloaded: true })
      }
    })

      //androidCoreWrapperModule.setUp(GetBitcoinConf(network,password))
          //androidCoreWrapperModule.startCore(true);

  }


  async startLND() {
      var that = this;
   
    CustomLog("starting lnd")
    const { network, backend, password } = this.state;
    var args = "--tor.active --tor.streamisolation --tor.v3 --listen=localhost"; //this stops neutrino working?
    args = "";
    await lndMobileWrapperModule.setUp(network);
    console.log("set up");
    var config = GetLNDConf(network, backend, password);



    let res = await lndMobileWrapperModule.startLND(args, config, false);

    CustomLog("lndstart", res);



  }
  async createNewLNDWallet() {

    const { password } = this.state;
    var that = this;

    CustomLog("generating seed")
    let fromJavaCode = await lndMobileWrapperModule.generateSeed();

    CustomLog("gen seed", fromJavaCode);
    let res = JSON.parse(fromJavaCode);
    if (res.error == null) {
      var passphrase = res.cipherSeedMnemonic_.join(" ");
      let encryptedPassphrase = encrypt(password, passphrase);
      console.log(encryptedPassphrase);


      await SetUserPreferences("passphrase", encryptedPassphrase);


      CustomLog("init wallet")
      await lndMobileWrapperModule.initWallet(passphrase, password, -1, "")

      CustomLog("initiated wallet", fromJavaCode);

      await that.continueLoad();




    } else {
      alert(res.error);
    }



  }
  getBlockchainInfo() {
    CustomLog("get blockchain info");
    androidCoreWrapperModule.getBlockchainInfo();
  }
  continueLoad() {

    this.setState({ topStatusText: "connecting to LND..." })
    this.startGetInfo();


  }
  isJSON(jsonStr) {
    if (/^[\],:{}\s]*$/.test(jsonStr.replace(/\\["\\\/bfnrtu]/g, '@').
      replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
      replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
      return true;
    }

    return false;
  }

  async getOnChainBalance() {
    const { restURL, startUpData } = this.state;
    var that = this;
    let url = restURL + "/v1/balance/blockchain";
    let res = await lndMobileWrapperModule.makeHttpRequest(url)

    CustomLog("getOnChainBalanceRes", res);

    if (that.isJSON(res)) {
      let data = JSON.parse(res);


      if (data.error != undefined) {
        CustomError(data.error);
      } else {
        if (data.confirmed_balance != undefined) {
          let btcValue = satsToBTC(data.confirmed_balance)
          cards[0].amount = btcValue;
          cards[0].fiat = BTCToFiat(btcValue, startUpData.rateOfBtc);
        }
        if (data.unconfirmed_balance != 0) {
          cards[0].unconf = data.unconfirmed_balance;
        }
      }
    }

  }

  async getOffChainBalance() {
    const { restURL, startUpData } = this.state;
    var that = this;
    let url = restURL + "/v1/balance/channels";
    let res = await lndMobileWrapperModule.makeHttpRequest(url)

    CustomLog("getOffChainBalanceRes", res);

    if (that.isJSON(res)) {
      let data = JSON.parse(res);


      if (data.error != undefined) {
        CustomError(data.error);
      } else {
        if (data.balance != undefined) {
          let btcValue = satsToBTC(data.balance)
          cards[1].amount = btcValue;
          cards[1].fiat = BTCToFiat(btcValue, startUpData.rateOfBtc);
        }

        if (data.pending_open_balance != 0) {
          cards[1].unconf = data.pending_open_balance;
        }
      }
    }

  }

  async startGetInfo() {

    CustomLog("start get info");

    const { neutrinoSynced, restURL, bitcoinDTorDownloaded, hiddenServiceStarted, bitcoinDStarted, startUpData } = this.state;

    let that = this;


    let url = restURL + "/v1/getinfo";
    let res = await lndMobileWrapperModule.makeHttpRequest(url);

    CustomLog("getInfoRes", res);

    if (that.isJSON(res)) {
      let getInfoData = JSON.parse(res);
      if (getInfoData.length == 1) {
        getInfoData = getInfoData[0];
      }
      if (getInfoData.error != undefined) {
        that.setState({ lightningImage: lightningOff });
        await new Promise(r => setTimeout(r, 2000));
        that.startGetInfo();
        return;
      } else {
        that.setState({ lightningImage: lightningOn });

        if (hiddenServiceStarted == false && bitcoinDTorDownloaded == true) {

          that.setState({ hiddenServiceStarted: true, topStatusText: "starting hidden service..." });
          androidCoreWrapperModule.startTorHiddenService();
        }
        if (hiddenServiceStarted == true && bitcoinDTorDownloaded == true && bitcoinDStarted == false && neutrinoSynced == true) {

          that.setState({ bitcoinDStarted: true, topStatusText: "starting bitcoind..." });

          var globalInfo = GetGlobalInfo();
          globalInfo.canShowConnectCode = true;
          SetGlobalInfo(globalInfo);
          androidCoreWrapperModule.startCore(true);

          await new Promise(r => setTimeout(r, 10000));
          that.startGetInfo();

          return;


        }

        CustomLog(hiddenServiceStarted + " " + bitcoinDTorDownloaded + " " + bitcoinDStarted)
      }

      let latestBlockHeight = startUpData.blockHeight;
      let currentBlockHeight = getInfoData.block_height;



      if (currentBlockHeight > startUpData.blockHeight) {
        var startUpDataTmp = startUpData;
        startUpDataTmp.blockHeight = currentBlockHeight;
        that.setState({ startUpData: startUpDataTmp })
      }

      if (currentBlockHeight == undefined) {
        that.setState({ statusText: "starting up...", showSyncProgress: false, showStatus: true })

      } else {
        CustomLog(latestBlockHeight);

        CustomLog(currentBlockHeight);
        let progress = (currentBlockHeight / latestBlockHeight) * 100;
        CustomLog(currentBlockHeight / latestBlockHeight);
        CustomLog(progress);
        var progressFormatted = Math.ceil(progress);


        CustomLog(progressFormatted);
        that.setState({ syncProgress: progressFormatted, syncText: progressFormatted + "%", syncTextSmall: "initial sync, this should just take a few mins", showSyncProgress: true, showStatus: false });


        if (getInfoData.synced_to_chain == true) {

          that.setState({ showStartView: false, neutrinoSynced: true });

          that.getOnChainBalance();
          that.getOffChainBalance();



        }

      }
    } else {
      CustomError("json error");
    }


    CustomLog("got info finish");

    await new Promise(r => setTimeout(r, 5000));
    CustomLog("got info finish cont");
    that.startGetInfo();


  }


  async unlockLNDWallet() {
    const { password } = this.state;
    let that = this;


    CustomLog("unlock wallet ", password)
    var fromJavaCode = await lndMobileWrapperModule.unlockWallet(password, -1);

    CustomLog("unloik", fromJavaCode);

    that.continueLoad();



  }

  formatSyncData(val, blocks, headers) {

    function formatPercentage(val) {
      val = val + "";
      if (parseFloat(val) >= 1) {
        return 4;
      }
      val = val.split(".");

      if (val.length > 1) {
        val = val[1];
        for (var i = 0; i < val.length; i++) {
          var char = val.charAt(i);
          if (char != "0") {
            return i + 1;
          }
        }
      }
    }


    if (headers > blocks) {//verification can be 1 but there are more headers than blocks so in this case set val to the percentage of blocks comared to headers
      val = (blocks / headers) * 100;
    }

    CustomLog("blocks headers ", val + " " + blocks + " " + headers);


    if (Math.ceil(val) == 100) {

      CustomLog("val is 100", val);

      if (blocks >= headers) {
        CustomLog("blocks greater than headers", blocks + " " + headers);

        return {
          synced: true,
        }

      }
    }

    var genesis = 1231006505;
    if (this.state.network === "testnet") {
      genesis = 1296688602;//testnet
    }

    var nowTS = parseInt(Date.now() / 1000);

    var timeDiff = nowTS - genesis;

    var timeToAdd = parseInt(timeDiff * (val / 100))

    var newTime = genesis + timeToAdd;;

    var date = new Date(newTime * 1000);
    var months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    var daysEnd = { "1": "st", "2": "nd", "3": "rd", "4": "th" }

    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate() + "";

    var dayEnd = daysEnd[day.substr(day.length - 1)];

    if (parseInt(day) > 10 && parseInt(day) < 20) {
      dayEnd = "th";
    }

    if (dayEnd == undefined) {
      dayEnd = "th";
    }

    var formattedTime = day + dayEnd + " " + months[month] + " " + year;

    return {
      showPercentage: true,
      status: "validating through " + formattedTime + "\nblocks: " + blocks + "/" + headers,
      description: val.toFixed(formatPercentage(val)) + "%",
      val: val
    }

  }

  render() {
    const { syncProgress, progressSize, statusText, showStatus, syncTextSmall, syncText, showSyncProgress, showProgress, showStartView, y, onionImage, lightningImage, bitcoindImage, topStatusText } = this.state;
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.topIcons}>
              <Tooltip height={100} width={200} withOverlay={false} popover={<Text>Indicates whether tor is running, allowing you to connect privately to your node</Text>}>
                <Image source={onionImage}
                  style={styles.onionIcon} />
              </Tooltip>
              <Tooltip height={50} width={200} withOverlay={false} popover={<Text>Indicates whether LND is running</Text>}>

                <Image source={lightningImage}
                  style={styles.lightningIcon} />
              </Tooltip>
              <Tooltip height={50} width={200} withOverlay={false} popover={<Text>Indicates whether bitcoind is running</Text>}>

                <Image source={bitcoindImage}
                  style={styles.bitcoindIcon} />
              </Tooltip>

            </View>
            <View style={[styles.statusTopView]} >
              <Tooltip height={100} width={200} withOverlay={false} popover={<Text>You can see the current status if bitcoind syncing here</Text>}>
                <Text style={[styles.topStatus]} >{topStatusText}</Text>
              </Tooltip>
            </View>
          </View>

          {!showStartView &&


            <View style={styles.cardsView}>

              <View style={StyleSheet.absoluteFill}>
                {cards.map((card, i) => {
                  const inputRange = [-cardHeight, 0];
                  const outputRange = [
                    cardHeight * i,
                    (cardHeight - cardTitle) * -i
                  ];
                  if (i > 0) {
                    inputRange.push(cardPadding * i);
                    outputRange.push((cardHeight - cardPadding) * -i);
                  }
                  const translateY = y.interpolate({
                    inputRange,
                    outputRange,
                    extrapolateRight: "clamp"
                  });
                  return (
                    <Animated.View
                      key={card.name}
                      style={{ transform: [{ translateY }] }}
                    >

                      <View style={[styles.card, { backgroundColor: card.color }]} >

                        <Text style={[styles.cardTitle]} >{card.name}</Text>
                        <Divider style={[styles.seperator, { backgroundColor: card.altColor }]} />
                        <View style={[styles.topLine]} >
                          <Text style={[styles.cardAmount]} >{card.amount}</Text>

                          <Text style={[styles.bitcoinDenomination]} > btc {card.unconf}</Text>
                        </View>
                        <View style={[styles.topLine]} >

                          <Text style={[styles.fiatDenomination]} >$</Text>
                          <Text style={[styles.cardAmountFiat]} >{card.fiat}</Text>

                        </View>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
              <Animated.ScrollView
                scrollEventThrottle={16}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                  [
                    {
                      nativeEvent: {
                        contentOffset: { y }
                      }
                    }
                  ],
                  { useNativeDriver: true }
                )}
              />


            </View>
          }
          {showStartView &&
            <View style={styles.innerView}>




              {showProgress &&
                <View style={styles.progressView}>
                  <View style={styles.progressTextView}>
                    {showSyncProgress &&
                      <View>
                        <Text style={styles.progressTextLarge}>
                          {syncText}
                        </Text>
                        <Text style={styles.progressTextSmall}>
                          {syncTextSmall}
                        </Text>
                      </View>
                    }
                    {showStatus &&
                      <Text style={styles.statusText}>
                        {statusText}
                      </Text>}
                  </View>


                  <AnimatedCircularProgress
                    size={progressSize}
                    width={15}
                    fill={syncProgress}
                    tintColor="#454648"
                    onAnimationComplete={() => console.log('onAnimationComplete')}
                    backgroundColor="#9ea6a9" />


                </View>
              }



            </View>}




        </View>



      </SafeAreaView>




    );
  }
}



export default HomeScreen;
