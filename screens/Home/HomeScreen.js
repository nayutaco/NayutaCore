import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Tooltip, Text } from 'react-native-elements';
import styles from './HomeScreenStyles';
import { generateSecureRandom } from 'react-native-securerandom';
import * as Keychain from 'react-native-keychain';
import { encrypt } from 'react-native-simple-encryption';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import DeviceInfo from 'react-native-device-info';

import { NavigationEvents } from 'react-navigation';
import { IsJSON, SetGlobalInfo, GetGlobalInfo, CustomLog, CustomError, GetBitcoinConf, GetLNDConf, SetUserPreferences, GetUserPreferences, GetNodeFromStartUpData, GetTestnetPeers, TimeoutPromise } from '../../tools/utils';
import Timeline from 'react-native-timeline-flatlist'
import BitsAnimation from "../../misc/BitsAnimation";
import {
  TouchableOpacity,
  NativeEventEmitter,
  Image,
  NativeModules,
  Dimensions,
  View,
  Animated,
  SafeAreaView,
  FlatList,
  BackHandler,
  DeviceEventEmitter
} from 'react-native';
const onionOff = require('../../assets/images/onionOff.png');
const onionOn = require('../../assets/images/onion.png');
const lightningOff = require('../../assets/images/boltOff.png');
const lightningOn = require('../../assets/images/bolt.png');
const bitcoindOff = require('../../assets/images/btcOff.png');
const bitcoindOn = require('../../assets/images/btc.png');
const timelineProviderImage = require('../../assets/images/99Bitcoins.png');


const lndMobileWrapperModule = NativeModules.LNDMobileWrapper;
const androidCoreWrapperModule = NativeModules.AndroidCoreWrapper;



function Item({ block }) {
  return (
    <View style={styles.blockCell}>
      <View style={styles.blockCellInner}>
        <Text style={styles.blockTitle}>#{block.height}</Text>

        <View style={styles.blockCellInfo}>

          <View style={styles.blockInfoRow}>
            <Text style={styles.blockSubTitle}>time:</Text>
            <Text style={styles.blockSubTitleText}> {block.time}</Text>
          </View>


          <View style={styles.blockInfoRow}>
            <Text style={styles.blockSubTitle}>txs:</Text>
            <Text style={styles.blockSubTitleText}>{block.txs}</Text>
          </View>

          <View style={styles.blockInfoRow}><Text style={styles.blockSubTitle}>segwit txs:</Text><Text style={styles.blockSubTitleText}>{block.swtxs}</Text></View>
          <View style={styles.blockInfoRow}><Text style={styles.blockSubTitle}>volume:</Text><Text style={styles.blockSubTitleText}>{block.total_out / 100000000} BTC</Text></View>
          <View style={styles.blockInfoRow}><Text style={styles.blockSubTitle}>size:</Text><Text style={styles.blockSubTitleText}>{block.total_size / 1000000} mb</Text></View>
        </View>
      </View>
    </View>
  );
}
class HomeScreen extends Component {
  hiddenServiceStarted = false;
  didShowForkAlert = false;
  walletExists = false;
  isShowingBlock = false;
  lastBitcoinGetInfo = null;
  LNDStarted = false;
  didShowConnect = false;
  getBlockchainInfoIntervalTime = 1000;
  gettingBlockchainInfo = false;
  didStartLND = false;
  didStartBitcoind = false;
  didStartRestart = false;
  stoppedBitcoind = false;
  stoppedAll = false;

  state = {
    debugText: "debug info",
    lndBlocks: {},
    bitcoindBlocks: {},
    syncBlocksData: [],
    currentBitcoinDBlock: 0,
    showClock: false,
    alwaysNeutrinoBackend: false,
    showTimeLine: true,
    showFullSync: false,
    currentBlockHash: "",
    maxMemory: 0,
    hiddenServiceStarting: false,
    startingServices: false,
    showStop: false,
    data: [],
    didSetFirstData: false,
    activeData: [],
    LNDSynced: false,
    didStartTor: false,
    bitcoinDSynced: false,
    percentage: "0%",
    didSetConnect: false,
    statusText2Style: "small",
    backend: "neutrino",
    password: "password",
    restURL: "https://127.0.0.1:8080",
    network: "testnet",//"mainnet",
    bitcoinDStarted: false,
    bitcoinDTorDownloaded: false,
    timelineProviderImage: timelineProviderImage,
    onionImage: onionOff,
    lightningImage: lightningOff,
    bitcoindImage: bitcoindOff,
    y: new Animated.Value(0),
    showStartView: true,
    showStatus: false,
    statusText1: "starting up",
    statusText2: "please wait...",
    statusText3: "",
    syncText: "",
    startUpData: {},
    syncProgress: 0,
    headers: 0,
    showProgress: true,
    progressSize: Dimensions.get('window').width * 0.38,
    recentBlocks: []
  }
  constructor(props) {
    super(props);

  }


  _onBlurr = () => {
    BackHandler.removeEventListener('hardwareBackPress',
      this._handleBackButtonClick);
  }

  _onFocus = () => {
    BackHandler.addEventListener('hardwareBackPress',
      this._handleBackButtonClick);
  }

  _handleBackButtonClick = () => true


  formatTime(timestamp) {

    var dateObj = new Date(timestamp * 1000);

    var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    var mins = dateObj.getMinutes();
    if (mins < 10) {
      mins = "0" + mins;
    }
    return dateObj.getDate() + " " + monthArray[dateObj.getMonth()] + " " + dateObj.getFullYear() + " " + dateObj.getHours() + ":" + mins;
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
        CustomLog('No credentials stored');
        return new Promise(reject => {
          reject(false)
        });
      }
    } catch (error) {
      CustomLog("Keychain couldn't be accessed!", error);
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
        CustomLog('No credentials stored');

        return new Promise(reject => {
          reject(null)
        });
      }
    } catch (error) {
      CustomLog("Keychain couldn't be accessed!", error);
      return new Promise(reject => {
        reject("error")
      });
    }



  }

  TriggerBlock(response) {
    if (this.isShowingBlock == false) {
      this.isShowingBlock = true;
      this.setState({ currentBlockHash: response.bestblockhash })

      setTimeout(() => {
        this.setState({ currentBlockHash: "" })
        this.isShowingBlock = false;
      }, 20000)

    }

  }
  async componentDidMount() {

    //start listners for LND unlocked and RPC ready events
    DeviceEventEmitter.addListener('Unlocked', async (e) => {
      CustomLog("Received unlocked event");
      if (this.walletExists) {
        this.setState({ statusText2: "unlocking LND wallet..." })
        this.unlockLNDWallet();
      } else {
        this.setState({ statusText2: "creating LND wallet..." })
        this.createNewLNDWallet();
      }
    });
    DeviceEventEmitter.addListener('RPCReady', async (e) => {
      CustomLog("Received rpcready event");
      this.continueLoad();
    });

    let mem = await DeviceInfo.getTotalMemory();

    CustomLog("memory is " + mem);
    const history = require('./../../assets/bitcoin_history.json');

    var globalInfo = GetGlobalInfo();

    const network = await GetUserPreferences("network", "mainnet");

    CustomLog("network is", network);

    this.setState({ data: history, maxMemory: mem, network: network });

    globalInfo.network = network;

    SetGlobalInfo(globalInfo);

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
        CustomLog("password create")
        that.setState({ password: password })
        await that.getBackend();


      } else {
        throw "keychain error!"
      }

    } else {
      CustomLog("password unlock")
      that.setState({ password: password })
      await that.getBackend();
    }


  }

  async getBackend() {
    const { network, password, maxMemory } = this.state;

    var that = this;

    androidCoreWrapperModule.setUp(GetBitcoinConf(network, password, maxMemory))

    let backend = await GetUserPreferences("backend");

    var alwaysNeutrinoBackendTmp = await GetUserPreferences("alwaysNeutrinoBackend");

    if (alwaysNeutrinoBackendTmp === "true") {
      backend = "neutrino";
    }
    backend = "neutrino";
    if (backend != undefined || backend != null) {
      that.setState({ backend: backend })
    }
    CustomLog("backend ", that.state.backend);


    this.loadBitcoinServices();


    that.setState({ alwaysNeutrinoBackend: true, statusText1: "starting...", showSyncProgress: false, showStatus: true, statusText2: "getting start up info..." })



  }

  loadStartUpInfo() {

    const { network } = this.state;
    var baseUrl = "https://wallet.nayuta.co/wallet/api/v1/";
    if (network === "testnet") {
      baseUrl = "https://shop.nayuta.co/wallet/api/v1/"
    }
    var that = this;
    try {

      TimeoutPromise(15000, new Error('Timed Out!'), fetch(baseUrl + "nodeinfo"))
        .then(function (response) {

          response.json().then(responseJson => {
            that.parseAPIInfo(responseJson);

          }).catch(function (error) {
            CustomLog("Error json", error);
            that.parseAPIInfo(undefined);
            throw error;
          })
        })
        .catch(function (error) {
          CustomLog("Error api", error);
          that.parseAPIInfo(undefined);
          throw error;
        })

    } catch (e) {

      alert(e);
    }
  }

  showInitialMessages() {
    let tempData = this.state.activeData;


    tempData.unshift({ time: 'Welcome', title: '', description: 'The app will perform a quick initial sync which should take a few minutes to complete and you can start connecting your 3rd party apps' },
    );

    if (this.didStartBitcoind == false) {
      this.setState({ activeData: tempData });
    }

    var that = this;

    setTimeout(function () {
      tempData.unshift({ time: 'A few things', title: '', description: 'After this the app will perform a full validation which will take several days to complete' },
      );

      if (that.didStartBitcoind == false) {
        that.setState({ activeData: tempData });
      }

      setTimeout(function () {
        tempData.unshift({ time: 'After that', title: '', description: 'Make sure to check back during this longer sync, on this time line the app will display the bitcoin price and historical events that occured at each block' },
        );
        if (that.didStartBitcoind == false) {
          that.setState({ activeData: tempData });
        }

      }, 4000);

    }, 4000);

  }

  parseAPIInfo(responseJson) {

    var that = this;
    CustomLog("res", responseJson)

    if (responseJson === undefined || responseJson.blockHeight == undefined) {
      CustomLog("api error, setting mock data")
      responseJson = { blockHeight: -1 };
    }

    that.setState({ startUpData: responseJson });


    that.setState({ statusText1: "starting...", showSyncProgress: false, showStatus: true, statusText2: "starting LND..." })

    that.startLNDServices()



  }

  checkIfLNDIsRunning(info) {
    try {
      var jsonRes = JSON.parse(info);
      if (jsonRes.error == undefined) {
        return true
      }
    } catch (e) {
    }
    return false;
  }
  async startLNDServices() {
    const { network, restURL } = this.state;
    let fromJavaCode = await lndMobileWrapperModule.checkIfWalletExists(network);
    CustomLog("wallet exists", fromJavaCode);
    let res = JSON.parse(fromJavaCode);
    this.walletExists = res.exists;

    let url = restURL + "/v1/getinfo";
    let res2 = await lndMobileWrapperModule.makeHttpRequest(url);

    CustomLog("getInfoResCheckIfRunning", res2);

    var isRunning = this.checkIfLNDIsRunning(res2);


    CustomLog("lnd is running ", isRunning);
    if (isRunning) {
      this.setState({ statusText2: "LND already running..." })
      this.startGetInfo();
    } else {
      this.startLND()
    }

    this.showInitialMessages();

  }

  setFirstData(rawDate) {

    if (rawDate == undefined) {
      return;
    }
    var rawDateObject = new Date(rawDate.year, rawDate.month, rawDate.day);


    var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    var tempData = [];
    tempData = tempData.reverse();
    for (var key in this.state.data) {
      var eventDateParts = key.split(" ");

      eventDateParts[1] = eventDateParts[1].replace(",", "");
      eventDateParts[0] = monthArray.indexOf(eventDateParts[0]);

      var eventDateObject = new Date(eventDateParts[2], eventDateParts[0], eventDateParts[1]);


      var anEvent = this.state.data[key];
      if (eventDateObject.getTime() <= rawDateObject) {
        var price = anEvent[0];
        if (price === "0") {
          price = "$0";
        }
        tempData.unshift({ time: this.formatDate(key), title: anEvent[0] + '\n' + anEvent[1], description: anEvent[2] });
      }



    }
    tempData.reverse();
    this.setState({ activeData: tempData });


  }
  formatDate(date) {
    date = date.replace("January", "Jan");
    date = date.replace("February", "Feb");
    date = date.replace("March", "Mar");
    date = date.replace("April", "Apr");
    date = date.replace("June", "Jun");
    date = date.replace("July", "Jul");
    date = date.replace("August", "Aug");
    date = date.replace("September", "Sep");
    date = date.replace("October", "Oct");
    date = date.replace("November", "Nov");
    date = date.replace("December", "Dec");
    return date;
  }

  isEventAdded(newEvent) {
    for (var i = 0; i < this.state.activeData.length; i++) {
      let anEvent = this.state.activeData[i];
      if (anEvent.time === newEvent.time) {
        return true;
      }
    }


    return false
  }
  addNewEvent(rawDate) {
console.log("adding new date",rawDate);
    if (rawDate == undefined) {
      return;
    }

    rawDate.year = parseInt(rawDate.year);
    rawDate.month = parseInt(rawDate.month);
    rawDate.day = parseInt(rawDate.day);


    var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


    var tempData = this.state.activeData;

    for (var key in this.state.data) {

      var eventDateParts = key.split(" ");

      let year = parseInt(eventDateParts[2]);
      let day = parseInt(eventDateParts[1].replace(",", ""));
      let month = parseInt(monthArray.indexOf(eventDateParts[0]));

      var anEvent = this.state.data[key];
      let prospectiveEvent = { time: this.formatDate(key), title: anEvent[0] + '\n' + anEvent[1], description: anEvent[2] };
 
      if (year <= rawDate.year && month <= rawDate.month && day <= rawDate.day) {
 
        CustomLog("days match");
        if (!this.isEventAdded(prospectiveEvent)) {
          tempData.unshift(prospectiveEvent)
          this.setState({ activeData: tempData });
          return;
        }
      }


    }



  }

  ShowConnectButton() {
    if (this.hiddenServiceStarted == true && this.LNDStarted == true && this.didShowConnect == false) {
      this.didShowConnect = true;
      this.setState({ didSetConnect: true });
      var globalInfo = GetGlobalInfo();
      globalInfo.canShowConnectCode = true;
      SetGlobalInfo(globalInfo);

    }
  }
  async loadBitcoinServices() {

    const { bitcoinDStarted, currentBitcoinDBlock, bitcoindBlocks, syncBlocksData, hiddenServiceStarting, backend, didStartLND, alwaysNeutrinoBackend } = this.state;
    var that = this;
    that.didStartBitcoind = true;
    eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    CustomLog("loading bitcoin services");

    eventEmitter.addListener('event', async (event) => {

      CustomLog("event", event)
      try {
        var jsonData = JSON.parse(event.data);

        if (jsonData.debug != undefined) {

          that.setState({ debugText: jsonData.debug })

        }
        if (jsonData.response === "wifi off") {

          let requireWifi = await GetUserPreferences("unlimitedMode") === "TRUE" ? false : true;

          CustomLog("require wifi - ", requireWifi);
          if (requireWifi) {

            that.setState({ bitcoindImage: bitcoindOff, bitcoinDStarted: false })
            that.setState({ statusText1: "waiting for wifi", statusText2: "once your device is connected to wifi bitcoind sync will start" });

            that.stoppedBitcoind = true;
          }


        } else if (jsonData.response === "wifi on") {

          if (that.stoppedBitcoind) {
            that.setState({ statusText1: "wifi connected", statusText2: "waiting for the OS to start bitcoind, (this may take sometime)" });
            let requireWifi = await GetUserPreferences("unlimitedMode") === "TRUE" ? false : true;

            androidCoreWrapperModule.registerBackgroundSync(requireWifi);
          }
          that.stoppedBitcoind = false;
        }

        if (that.stoppedBitcoind) {

          setTimeout(function () {
            that.getBlockchainInfo();
          }, that.getBlockchainInfoIntervalTime);
          return;
        }

        CustomLog("eventJSON", jsonData)
        if (jsonData.error == true) {
          that.setState({ bitcoindImage: bitcoindOff, bitcoinDStarted: false })
          if (jsonData.response === "rpc") {

            if (jsonData.res !== "no value") {

              if (jsonData.res === "Rewinding blocks..." || jsonData.res === "Loading block index..." || jsonData.res === "Verifying blocks...") {
                that.setState({ statusText1: "bitcoind starting", statusText2: jsonData.res });
              } else {
                that.setState({ statusText1: "please wait..", statusText2: jsonData.res });
              }
            }

          } else if (jsonData.response.indexOf("-reindex") != -1) {
            alert("something went wrong and the node now needs to reindex, this may take some time");
            that.reindex();
          }
          else if (jsonData.response == "download") {
            alert(jsonData.res);
          }
          else {
            if (bitcoinDStarted) {
              alert(jsonData.response);
            }

            else if (jsonData.response.indexOf("hidden service error") != -1) {
              CustomLog("hidden service error");
              console.log("Sdsdsd idden service error");
              that.hiddenServiceStarted = false;
              that.setState({ onionImage: onionOff, hiddenServiceStarting: false })

              if (that.LNDStarted == false) {



                CustomLog("loading from api anyway");
                that.loadStartUpInfo();

                that.ShowConnectButton();

                that.setState({ onionImage: onionOn, hiddenServiceStarting: true });

              }

            }



          }
        } else {



          if (jsonData.response === "downloaded") {
            that.startTor();
          }
          else if (jsonData.response === "download") {
            //do nothing for now
          }
          else if (jsonData.response == "already started") {
            //do nothing for now
          }
          else if (jsonData.response == "hidden service started") {
            CustomLog("hidden service started, show connect button " + that.hiddenServiceStarted);

            if (that.hiddenServiceStarted == false) {
              CustomLog("loading from api");
              that.loadStartUpInfo();
            }

            that.hiddenServiceStarted = true;

            that.ShowConnectButton();

            that.setState({ onionImage: onionOn, hiddenServiceStarting: true });

          }

          else if (jsonData.response == "starting") {

            that.setState({ bitcoindImage: bitcoindOn, bitcoinDStarted: true })


          }
          else if (jsonData.response == "rpc") {

            if (jsonData.command == "getblockchaininfo") {



              that.setState({ bitcoindImage: bitcoindOn, bitcoinDStarted: true })
              var headersMax = that.state.startUpData.blockHeight;
              var response = JSON.parse(jsonData.res);
              if (response.blocks == 0) {


                CustomLog("headersMax ", headersMax);


                var val = Math.floor((response.headers / headersMax) * 100);
                var headers = response.headers + "/" + headersMax;


                CustomLog("val ", val);
                if (headersMax == -1) {
                  that.setState({ statusText1: "Downloading headers", statusText2: response.headers, percentage: "", syncProgress: 0 });

                } else {
                  that.setState({ statusText1: "Downloading headers", statusText2: headers, percentage: val + "%", syncProgress: val });


                }


              } else {

                that.saveBitcoinDBlocks(response.blocks, response.bestblockhash);

                that.setState({ currentBitcoinDBlock: response.blocks });

                var res = this.formatSyncData(
                  parseFloat(response.verificationprogress + "") * 100,
                  response.blocks,
                  headersMax
                );

                if (that.state.didSetFirstData == false) {

                  that.setState({ didSetFirstData: true });

                  that.setFirstData(res.dateRaw)
                } else {
                  that.addNewEvent(res.dateRaw)
                }
                if (res.synced) {

                  if (response.blocks > 0) {
                    CustomLog("getting last 10 blocks");
                    for (var i = 0; i < 10; i++) {

                      androidCoreWrapperModule.getBlockStats(response.blocks - i);

                    }
                  }
                  let status2String = "current block\n" + response.blocks + "\n" + "difficulty\n" + response.difficulty;

                  that.setState({ percentage: "100%", statusText1: "Synced", statusText2: status2String, bitcoinDSynced: true });


                  that.setState({ showTimeLine: false, showFullSync: true })
                  if (this.didStartLND == false) {

                    this.didStartLND = true;
                    that.startLNDServices()
                  }

                  this.lastBitcoinGetInfo = response;


                } else {

                  that.setState({ statusText1: res.blocks, statusText2: res.date, percentage: res.percentage, syncProgress: res.val });
                }
              }

            } else if (jsonData.command == "getblockstats") {
              CustomLog("got block stats");
              var obj = JSON.parse(jsonData.res);

              if (that.containsBlock(syncBlocksData, obj) == false) {
                CustomLog("added to array");
                obj.time = that.formatTime(obj.time);
                syncBlocksData.push(obj);
              }

              var syncBlocksDataTmp = syncBlocksData;

              syncBlocksDataTmp = syncBlocksDataTmp.sort((a, b) => (a.height < b.height) ? 1 : -1)

              if (syncBlocksDataTmp.length > 40) {
                syncBlocksDataTmp.pop();
                CustomLog("popped array");
              }
              CustomLog("array length " + syncBlocksDataTmp.length);
              that.setState({ syncBlocksData: syncBlocksDataTmp });

            }



          }

        }
      } catch (e) {
        CustomError(e);
      }
    });


    that.startTor();


  }

  containsBlock(array, obj) {
    for (var i = 0; i < array.length; i++) {
      var arr = array[i];
      if (arr.blockhash === obj.blockhash) {
        return true;
      }
    }
    return false;
  }
  async startBitcoinD() {

    if (this.state.hiddenServiceStarting == false) {

      this.setState({ hiddenServiceStarting: true });

      CustomLog("starting tor ", this.state.hiddenServiceStarting)

      this.startTor();

    } else {

      CustomLog("tor all ready started")

    }


    let requireWifi = await GetUserPreferences("unlimitedMode") === "TRUE" ? false : true;

    var statusText1 = "starting bitcoind";
    var statusText2 = "please wait...";
    if (requireWifi) {
      statusText1 = "waiting for wifi";
      statusText2 = "once your device is connected to wifi bitcoind sync will start";
    }
    this.setState({ bitcoinDTorDownloaded: true, bitcoinDStarted: true, statusText1: statusText1, statusText2: statusText2 });
    const isRunning = await androidCoreWrapperModule.checkIfServiceIsRunning("com.mandelduck.androidcore.CoreService");

    var that = this;
    CustomLog("is running", isRunning);
    if (isRunning) {
      this.setState({ debugText: "already running bitcoind" });
      CustomLog("service is running");

      androidCoreWrapperModule.startWifiCheck();

    } else {
      this.setState({ debugText: "bitcoind not running" });
      CustomLog("service is not running");


      androidCoreWrapperModule.cancelJob();

      androidCoreWrapperModule.cancelForeground();

      androidCoreWrapperModule.stopCore();

      CustomLog("require wifi", requireWifi);

      androidCoreWrapperModule.registerBackgroundSync(requireWifi);

    }




    setTimeout(function () {
      that.getBlockchainInfo();
    }, that.getBlockchainInfoIntervalTime);


    this.startTor();

  }


  stopAll() {
    const { bitcoinDStarted } = this.state;
    if (this.LNDStarted) {
      CustomLog("stopping lnd");
      lndMobileWrapperModule.stopLND();
      this.setState({ lightningImage: lightningOff });
    }

    if (bitcoinDStarted) {
      CustomLog("stopping bitcoind");
      androidCoreWrapperModule.cancelJob();

      androidCoreWrapperModule.cancelForeground();

      androidCoreWrapperModule.stopCore();

    }

    if (this.hiddenServiceStarted) {
      androidCoreWrapperModule.stopTorHiddenService();
      this.hiddenServiceStarted = false;
      this.setState({ onionImage: onionOff, hiddenServiceStarting: false })
    }
    this.stoppedAll = true;
    this.stoppedBitcoind = true;
    var that = this;
    setTimeout(function () {
      that.setState({ percentage: "", syncProgress: 0, statusText1: "stopped.", statusText2: "you may now close the application" });
    }, 2000);

    alert("you can now safely close the app, please reload the app inorder to restart the node")


  }
  async reindex() {
    CustomLog("reindex")

    androidCoreWrapperModule.cancelJob();

    androidCoreWrapperModule.cancelForeground();

    androidCoreWrapperModule.stopCore();

    let requireWifi = await GetUserPreferences("unlimitedMode") === "TRUE" ? false : true;


    CustomLog("require wifi", requireWifi);

    androidCoreWrapperModule.registerBackgroundSync(requireWifi);

  }

  async startLND() {

    const { startUpData, network, backend, password } = this.state;

    CustomLog("starting lnd with network", network)

    await lndMobileWrapperModule.setUp(network);
    CustomLog("set up");


    var peers = [];
    let nayutaPeer = GetNodeFromStartUpData(startUpData);

    if (nayutaPeer != undefined && nayutaPeer != null) {
      // peers.push(nayutaPeer);
    }
    /*
    if (network === "testnet") {
      let testnetPeers = GetTestnetPeers();

      CustomLog("testnet peers", testnetPeers);
      peers = peers.concat(testnetPeers);
    }*/
    CustomLog("testnet peers", peers);

    let singleNeutrinoPeer = await GetUserPreferences("neutrinoPeer", "");

    const apiLevel = await DeviceInfo.getApiLevel()

    const tor = await GetUserPreferences("enableTor", "false");

    var config = GetLNDConf(network, backend, password, peers, singleNeutrinoPeer, tor);
    CustomLog("api level", apiLevel);

    let args = "";
    let res = await lndMobileWrapperModule.startLND(args, config, false);
    CustomLog("lndstart", res);





  }
  async createNewLNDWallet() {

    const { password } = this.state;
    var that = this;

    CustomLog("generating seed")
    let fromJavaCode = await lndMobileWrapperModule.generateSeed();

    let res = JSON.parse(fromJavaCode);
    if (res.error == null) {
      var passphrase = res.cipherSeedMnemonic_.join(" ");
      let encryptedPassphrase = encrypt(password, passphrase);
      CustomLog(encryptedPassphrase);

      await SetUserPreferences("passphrase", encryptedPassphrase);

      CustomLog("init wallet")
      await lndMobileWrapperModule.initWallet(passphrase, password, -1, "")

      CustomLog("initiated wallet", fromJavaCode);

      that.continueLoad();

    } else {
      alert(res.error);
    }

  }

  getBlockchainInfo() {
    CustomLog("get blockchain info..");
    if (this.stoppedAll) {
      return;
    }
    CustomLog("get blockchain info continue..");
    androidCoreWrapperModule.getBlockchainInfo();


  }

  continueLoad() {
    this.setState({ statusText2: "connecting to LND..." })
    this.startGetInfo();


  }





  startTor() {
    CustomLog("start tor");
    if (this.stoppedAll) {
      return;
    }
    this.setState({ hiddenServiceStarting: true, topStatusText: "starting hidden service..." });
    androidCoreWrapperModule.startTorHiddenService();
  }

  async startGetInfo() {

    CustomLog("start get info");

    const { lndBlocks, backend, startingServices, restURL, bitcoinDTorDownloaded, bitcoinDStarted, bitcoinDSynced, startUpData, didSetConnect, LNDSynced } = this.state;

    let that = this;


    let url = restURL + "/v1/getinfo";
    let res = await lndMobileWrapperModule.makeHttpRequest(url);

    CustomLog("getInfoRes", res);

    if (IsJSON(res)) {
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
        that.setState({ lightningImage: lightningOn, showStop: true });
        that.LNDStarted = true;
        that.ShowConnectButton();
      }



      var globalInfo = GetGlobalInfo();


      globalInfo.lndGetInfo = res;

      SetGlobalInfo(globalInfo);




      let latestBlockHeight = startUpData.blockHeight;
      let currentBlockHeight = getInfoData.block_height;


      if (latestBlockHeight != -1) {




        if (currentBlockHeight > latestBlockHeight) {
          var startUpDataTmp = startUpData;
          startUpDataTmp.blockHeight = currentBlockHeight;
          that.setState({ startUpData: startUpDataTmp })
        }

      }

      if (currentBlockHeight == undefined) {
        that.setState({ statusText2: "starting up...", showSyncProgress: false, showStatus: true })

      } else {
        CustomLog("lbh", latestBlockHeight);

        CustomLog("cbh", currentBlockHeight);

        that.saveLNDBlock(currentBlockHeight, getInfoData.block_hash);

        if (latestBlockHeight != -1) {

          var progress = (currentBlockHeight / latestBlockHeight) * 100;

          // progress = ((getInfoData.best_header_timestamp * 1000)/ Date.now() )*100;
          CustomLog(currentBlockHeight / latestBlockHeight);
          CustomLog("pro", progress);
          var proFixed = progress.toFixed(that.formatPercentage(progress));
          if (proFixed >= 100) {
            proFixed = 100;
          }
          var progressFormatted = + proFixed + "%";

        } else {
          var progress = 0;
          var progressFormatted = "?%";
        }


        CustomLog("prof", progressFormatted);


        if (backend !== "bitcoind") {
          if (getInfoData.synced_to_chain == true) {


            var startUpDataTmp = startUpData;
            startUpDataTmp.blockHeight = getInfoData.block_height;
            that.setState({ startUpData: startUpDataTmp });




            if (startingServices == false) {


              let tempData = that.state.activeData;


              tempData.unshift({ time: 'Syncing', title: '', description: 'The app will now perform a full validation of the blockchain...' });

              that.setState({ activeData: tempData, startingServices: true, percentage: "", syncProgress: progress, statusText1: "starting bitcoind...", statusText2: "initial sync complete" });

              that.startBitcoinD();




            }


            await new Promise(r => setTimeout(r, 10000));
            that.startGetInfo();
            return;

          } else {


            if (latestBlockHeight == -1) {
              that.setState({ percentage: "", syncProgress: 0, statusText2: "this should just take a few mins, block:" + currentBlockHeight, statusText1: "initial sync" });

            } else {

              if (progress == 100) { //if is not synced but progress is 100 its not really 100 so set to 99.99
                progress = 99;
                progressFormatted = "99.99%";
              }

              that.setState({ percentage: progressFormatted, syncProgress: progress, statusText2: "this should just take a few mins", statusText1: "initial sync" });
            }

          }

        } else {

          //show synced message

          var tempData = that.state.activeData;

          tempData = [];
          tempData.push({ time: 'Validated', title: '', description: 'The node is fully synced and LND is running off of bitcoind' });
          tempData.push({ time: 'Important', title: '', description: 'Make sure that this device is kept on and connected to a power and wifi source' });
          that.setState({ activeData: tempData });


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
  saveBitcoinDBlocks(blockHeight, blockHash) {
    const { bitcoindBlocks } = this.state;
    bitcoindBlocks[blockHeight + ""] = blockHash;

    this.cleanUpSavedBlocks()
    this.checkNeutrinoBlocks();
  }
  saveLNDBlock(currentBlockHeight, blockHash) {
    const { lndBlocks } = this.state;
    lndBlocks[currentBlockHeight + ""] = blockHash;

    this.cleanUpSavedBlocks()
    this.checkNeutrinoBlocks();
  }
  cleanUpSavedBlocks() {
    const { lndBlocks, bitcoindBlocks } = this.state;
    var keys = Object.keys(lndBlocks);
    if (keys.length > 6) {
      delete lndBlocks[keys[0]];
    }



    keys = Object.keys(bitcoindBlocks);
    if (keys.length > 6) {
      delete bitcoindBlocks[keys[0]];
    }



  }
  checkNeutrinoBlocks() {

    const { lndBlocks, bitcoindBlocks } = this.state;
    var lndKeys = Object.keys(lndBlocks);
    var allBlocksValid = true;
    var lndBlockHash = "";
    var bitcoindBlockHash = "";
    var that = this;
    lndKeys.forEach(aKey => {

      lndBlockHash = lndBlocks[aKey];
      bitcoindBlockHash = bitcoindBlocks[aKey];

      if (lndBlockHash != undefined && bitcoindBlockHash != undefined) {

        if (bitcoindBlockHash !== lndBlockHash) {

          allBlocksValid = false;
          if (allBlocksValid == false) {
            if (that.didShowForkAlert == false) {
              that.didShowForkAlert = true;
              alert("invalid block detected from neutrino\n\nbitcoind: " + bitcoindBlockHash + " \n\nneutrino: " + lndBlockHash + "\n\nyou may want to enter a custom neutrino server in the app settings to make sure the app uses the fork you choose");
            }
          }
          return;

        }
      }

    });


  }
  async unlockLNDWallet() {
    const { password } = this.state;
    let that = this;

    CustomLog("unlock wallet ", password)
    var fromJavaCode = await lndMobileWrapperModule.unlockWallet(password, -1);

    CustomLog("unlock", fromJavaCode);

    that.continueLoad();



  }
  formatPercentage(val) {
    val = val + "";
    if (parseFloat(val) >= 1) {
      return 2;
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

  formatSyncData(val, blocks, headers) {

    if (headers > blocks) {//verification can be 1 but there are more headers than blocks so in this case set val to the percentage of blocks comared to headers
      val = (blocks / headers) * 100;
    }

    CustomLog("blocks headers ", val + " " + blocks + " " + headers);


    if (Math.ceil(val) == 100) {

      CustomLog("val is 100", val);

      if (headers != -1) {
        if (blocks >= headers) {
          CustomLog("blocks greater than headers", blocks + " " + headers);

          return {
            synced: true,
          }

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
    var blocksString = "block\n" + blocks + "/" + headers;

    if (headers == -1) {
      blocksString = "block\n" + blocks;
    }

    var percentageStr = val.toFixed(this.formatPercentage(val)) + "%";

    if (val == 100) {
      percentageStr = "100%";
    }
    return {
      showPercentage: true,
      date: "validating " + formattedTime,
      dateRaw: { day: day, month: month, year: year },
      blocks: blocksString,
      currentBlock: blocks,
      percentage: percentageStr,
      val: val
    }

  }

  goToSettings() {
    //this.startLNDServices()
    this.props.navigation.navigate('Settings');
  }

  showConnection() {
    this.props.navigation.navigate('Connect');
  }

  render() {
    const { debugText, syncBlocksData, showTimeLine, showFullSync, showClock, currentBlockHash, timelineProviderImage, showStop, didSetConnect, activeData, percentage, syncProgress, progressSize, statusText1, statusText2, onionImage, lightningImage, bitcoindImage, } = this.state;
    return (
      <SafeAreaView style={styles.root}>
        <NavigationEvents
          onWillFocus={this._onFocus}
          onWillBlur={this._onBlurr}
        />

        <View style={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.topIcons}>
              <Tooltip height={50} width={200} withOverlay={false} popover={<Text>Indicates whether bitcoind is running</Text>}>

                <Image source={bitcoindImage}
                  style={styles.bitcoindIcon} />
              </Tooltip>
              <Tooltip height={100} width={200} withOverlay={false} popover={<Text>Indicates whether tor is running, allowing you to connect privately to your node</Text>}>
                <Image source={onionImage}
                  style={styles.onionIcon} />
              </Tooltip>
              <Tooltip height={50} width={200} withOverlay={false} popover={<Text>Indicates whether LND is running</Text>}>

                <Image source={lightningImage}
                  style={styles.lightningIcon} />
              </Tooltip>

              {/*<Text>{debugText}</Text>*/}
            </View>
            <TouchableOpacity style={[styles.settingsIcon]} onPress={this.goToSettings.bind(this)}>
              <Icon style={[{ color: "#9ea6a9" }]} size={22} name={'cogs'} />
            </TouchableOpacity>

          </View>



          <View style={styles.innerView}>
            <View style={styles.topView}>

              <View style={styles.progressView}>

                <View style={styles.circularProgressView}>
                  <AnimatedCircularProgress
                    size={progressSize}
                    width={10}
                    fill={syncProgress}
                    tintColor="#454648"
                    onAnimationComplete={() => CustomLog('onAnimationComplete')}
                    backgroundColor="#9ea6a9" />
                </View>
                <Text style={styles.percentageText}>
                  {percentage}
                </Text>
              </View>
              <View style={styles.detailsView}>
                <Text style={styles.statusText1}>
                  {statusText1}
                </Text>
                <Text style={styles.statusText2}>
                  {statusText2}
                </Text>

                <View style={[styles.topButtons]}>
                  {showStop &&
                    <TouchableOpacity style={[styles.roundedButton]} onPress={this.stopAll.bind(this)}>
                      <Text style={styles.simpleButtonText}>safe stop</Text>
                    </TouchableOpacity>

                  }

                  {didSetConnect &&
                    <TouchableOpacity style={[styles.roundedButton]} onPress={this.showConnection.bind(this)}>
                      <Text style={styles.simpleButtonText}>connect</Text>
                    </TouchableOpacity>
                  }


                </View>
              </View>

            </View>
            {showClock &&
              <BitsAnimation style={styles.bitsAnimation} hash={currentBlockHash} />
            }
            {showFullSync &&
              <FlatList style={styles.blocksList}
                data={syncBlocksData}
                renderItem={({ item }) => <Item block={item} />}
                keyExtractor={item => item.blockhash}
              />
            }

            {showTimeLine &&
              <View style={styles.timelineView}>
                <Timeline
                  data={activeData}
                  circleSize={25}
                  circleColor='rgb(247,147,27)'
                  lineColor='rgb(247,147,27)'
                  timeContainerStyle={{ minWidth: 100, marginTop: 0 }}
                  timeStyle={{ textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', padding: 5, borderRadius: 13 }}
                  descriptionStyle={{ color: 'gray' }}
                  options={{
                    style: {
                      paddingRight: 10,
                      paddingLeft: 10,
                    }
                  }}
                />
              </View>
            }

          </View>


        </View>
        {showTimeLine &&
          <View style={styles.timelineProvider}>
            <Text style={styles.timelineProviderText}>timeline data by</Text>
            <Image source={timelineProviderImage}
              style={styles.timelineProviderImage} />
          </View>
        }

      </SafeAreaView>




    );
  }
}



export default HomeScreen;
