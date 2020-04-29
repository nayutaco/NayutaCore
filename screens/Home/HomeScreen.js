import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Tooltip, Text } from 'react-native-elements';
import styles from './HomeScreenStyles';
import { generateSecureRandom } from 'react-native-securerandom';
import * as Keychain from 'react-native-keychain';
import { encrypt } from 'react-native-simple-encryption';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { SetGlobalInfo, GetGlobalInfo, BTCToFiat, satsToBTC, CustomLog, CustomError, GetBitcoinConf, GetLNDConf, SetUserPreferences, GetUserPreferences } from '../../tools/utils';
import Timeline from 'react-native-timeline-flatlist'

import {
  TouchableOpacity,
  NativeEventEmitter,
  Image,
  NativeModules,
  Dimensions,
  View,
  Animated,
  SafeAreaView,
  Alert
} from 'react-native';

const onionOff = require('../../assets/images/onionOff.png');
const onionOn = require('../../assets/images/onion.png');
const lightningOff = require('../../assets/images/boltOff.png');
const lightningOn = require('../../assets/images/bolt.png');
const bitcoindOff = require('../../assets/images/btcOff.png');
const bitcoindOn = require('../../assets/images/btc.png');



const lndMobileWrapperModule = NativeModules.LNDMobileWrapper;
const androidCoreWrapperModule = NativeModules.AndroidCoreWrapper;

class HomeScreen extends Component {
  //https://99bitcoins.com/bitcoin/historical-price/
  state = {
    startingServices:false,
    LNDStarted:false,
    showStop:false,
    data: [],
    didSetFirstData:false,
    activeData: [],
    LNDSynced: false,
    didStartTor: false,
    didStartLND: false,
    bitcoinDSynced: false,
    percentage: "0%",
    didSetConnect: false,
    statusText2Style: "small",
    backend: "neutrino",
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
    statusText1: "starting up",
    statusText2: "please wait...",
    statusText3: "",
    syncText: "",
    startUpData: {},
    syncProgress: 0,
    headers: 0,
    showProgress: true,
    progressSize: Dimensions.get('window').width * 0.38
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
    
 
    const history = require('./../../assets/bitcoin_history.json');
    this.setState({ data: history });

    var globalInfo = GetGlobalInfo();

    const network = await GetUserPreferences("network", "mainnet");

    CustomLog("network is", network);

    this.setState({ network: network });

    globalInfo.network = network;

    SetGlobalInfo(globalInfo);

    let tempData = this.state.activeData;

 
    tempData.unshift({ time:'Welcome', title: '', description: 'The app will perform a quick initial sync which should take a few minutes to complete and you can start connecting your 3rd party apps' },
    );

    this.setState({ activeData: tempData });

    var that = this;

    setTimeout(function () {
      tempData.unshift({ time: 'A few things', title: '', description: 'After this the app will perform a full validation which will take several days to complete' },
      );

      that.setState({ activeData: tempData });
 
      setTimeout(function () {
        tempData.unshift({ time: 'After that', title: '', description: 'Make sure to check back during this longer sync, on this time line the app will display the bitcoin price and historical events that occured at each block' },
        );
  
        that.setState({ activeData: tempData });
    
      }, 4000);
 
    }, 4000);
    //return;
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
    const { network } = this.state;
    let backend = await GetUserPreferences("backend");

    if (backend != undefined || backend != null) {
      this.setState({ backend: backend })
    }
    console.log("backend ", this.state.backend);


    this.setState({ statusText1: "starting...", showSyncProgress: false, showStatus: true, statusText2: "getting start up info..." })

    var baseUrl = "https://wallet.nayuta.co/wallet/api/v1/";
    if (network === "testnet") {
      baseUrl = "https://shop.nayuta.co/wallet/api/v1/"
    }
    const response = await fetch(baseUrl + "nodeinfo");
    const responseJson = await response.json();
    CustomLog("res", responseJson);
    this.setState({ startUpData: responseJson });


     this.startLNDServices()
   // await that.loadServices();



  }
  async startLNDServices() {
    const { network } = this.state;
    let fromJavaCode = await lndMobileWrapperModule.checkIfWalletExists(network);
    console.log("wallet exists", fromJavaCode);
    let res = JSON.parse(fromJavaCode);

    let startRes = await this.startLND()
    console.log("start res", startRes);

    if (res.exists) {
      this.setState({ statusText2: "unlocking LND wallet..." })
      await this.unlockLNDWallet();
    } else {
      this.setState({ statusText2: "creating LND wallet..." })
      await this.createNewLNDWallet();
    }
  }
  
  setFirstData(rawDate){

    var rawDateObject = new Date( rawDate.year, rawDate.month, rawDate.day); 

    console.log("rawdate",rawDateObject.toString())
 
    var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]
     
    console.log("rawdata",rawDate);
    var tempData = [];
    tempData = tempData.reverse();
    for(var key in this.state.data){
      var eventDateParts = key.split(" ");

      console.log("parts ",eventDateParts);
      eventDateParts[1] = eventDateParts[1].replace(",","");
      eventDateParts[0] = monthArray.indexOf( eventDateParts[0]);
      console.log("parts ",eventDateParts);
      var eventDateObject = new Date(eventDateParts[2],eventDateParts[0], eventDateParts[1]);


      console.log("eventdate",eventDateObject.toString())
      var anEvent = this.state.data[key];
      if(eventDateObject.getTime() <= rawDateObject){
        var price = anEvent[0];
        if(price === "0"){
           price = "$0";
        }
        tempData.unshift({time:this.formatDate(key),title:anEvent[0]+'\n'+anEvent[1],description:anEvent[2]});
      }
      

     
    }
    tempData.reverse();
    this.setState({activeData:tempData});

 
  }
 formatDate(date){
    date = date.replace("January","Jan");
    date = date.replace("February","Feb");
    date = date.replace("March","Mar");  
    date = date.replace("April","Apr");  
    date = date.replace("June","Jun");  
    date = date.replace("July","Jul");  
    date = date.replace("August","Aug");
    date = date.replace("September","Sep");
    date = date.replace("October","Oct");
    date = date.replace("November","Nov");
    date = date.replace("December","Dec");
    return date;
  }

  isEventAdded(newEvent){
    for(var i =0;i<this.state.activeData.length;i++){
      let anEvent = this.state.activeData[i];
      if(anEvent.time === newEvent.time){
        return true;
      }
    }
  

  return false
  }
  addNewEvent(rawDate){
    rawDate.year = parseInt(rawDate.year);
    rawDate.month = parseInt(rawDate.month);
    rawDate.day = parseInt(rawDate.day);
     
 
    var monthArray = ["January","February","March","April","May","June","July","August","September","October","November","December"]

   
    console.log("rawdata",rawDate);
    var tempData = this.state.activeData;
    
    for(var key in this.state.data){
      var eventDateParts = key.split(" ");
 
      let year  = parseInt(eventDateParts[2]);
      let day  = parseInt(eventDateParts[1].replace(",",""));
      let month = parseInt(monthArray.indexOf( eventDateParts[0]));
      
      var anEvent = this.state.data[key];
      let prospectiveEvent = {time:this.formatDate(key),title:anEvent[0]+'\n'+anEvent[1],description:anEvent[2]};

      if(year == rawDate.year && month == rawDate.month && day == rawDate.day){
      console.log("days match");
        if(!this.isEventAdded(prospectiveEvent)){
          tempData.unshift(prospectiveEvent)
          this.setState({activeData:tempData});
          return;
        }
      }
      
 
    }

    
 
  }
  async loadServices() {

    const { network, password,hiddenServiceStarted } = this.state;
    var that = this;
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    CustomLog("loading servicex");

    eventEmitter.addListener('event', (event) => {

      CustomLog("eventy", event)
      try {
        var jsonData = JSON.parse(event.data);
        CustomLog("eventJSON", jsonData)
        if (jsonData.error == true) {
          that.setState({ bitcoindImage: bitcoindOff, bitcoinDStarted: false })
          if (jsonData.response == "rpc") {

            if (jsonData.res !== "no value") {
              that.setState({ statusText2: jsonData.res });
            }

          }else if(jsonData.response.indexOf("-reindex") != -1){
            alert("something went wrong and the node now needs to reindex, this may take some time");
            that.reindex();
          }
          else if(jsonData.response == "download"){
            alert(jsonData.res); 
          }
          else {
            alert(jsonData.response);
          }
        } else {

          if (jsonData.response === "downloaded") {

            that.startBitcoinD();
          }
          else if (jsonData.response === "download") {

          }
          else if (jsonData.response == "already started") {


          }
          else if (jsonData.response == "hidden service started") {


            if(hiddenServiceStarted == false){
              that.setState({ didSetConnect: true });

              var globalInfo = GetGlobalInfo();
              globalInfo.canShowConnectCode = true;
              SetGlobalInfo(globalInfo);
              
            }

            that.setState({ onionImage: onionOn, hiddenServiceStarted: true });



          }
          else if (jsonData.response == "hidden service error") {
            that.setState({ onionImage: onionOff, hiddenServiceStarted: false })

          }
          else if (jsonData.response == "starting") {

            that.setState({ bitcoindImage: bitcoindOn, bitcoinDStarted: true })

if(hiddenServiceStarted == false){
    that.startTor();
}

    
            setTimeout(function () {
              that.getBlockchainInfo();
            }, 3000);

          }
          else if (jsonData.response == "rpc") {
            that.setState({ bitcoindImage: bitcoindOn, bitcoinDStarted: true })
            setTimeout(function () {
              that.getBlockchainInfo();
            }, 3000);

            var response = JSON.parse(jsonData.res);
            if (response.blocks == 0) {
              var headersMax = that.state.startUpData.blockHeight;
              CustomLog("headersMax ", headersMax);


              var val = Math.floor((response.headers / headersMax) * 100);
              CustomLog("val ", val);
              let headers = response.headers + "/" + headersMax;
              that.setState({ statusText1: "Downloading headers", statusText2: headers, percentage: val + "%", syncProgress: val });


            } else {

              

              var res = this.formatSyncData(
                parseFloat(response.verificationprogress + "") * 100,
                response.blocks,
                that.state.startUpData.blockHeight
              );
 
              if (that.state.didSetFirstData == false) {
              
                that.setState({ didSetFirstData: true });
               
                that.setFirstData(res.dateRaw)
              }else{
                that.addNewEvent(res.dateRaw)
              }


              if (res.synced) {

                let status2String = "current block\n" + res.currentBlock + "\n" + "difficulty\n" + response.difficulty;

                that.setState({ percentage: "100%", statusText1: "Synced", statusText2: status2String, bitcoinDSynced: true });

          

              } else {

                that.setState({ statusText1: res.blocks, statusText2: res.date, percentage: res.percentage, syncProgress: res.val });
              }
            }

          }
        }
      } catch (e) {
        CustomError(e);
      }
    });

    androidCoreWrapperModule.setUp(GetBitcoinConf(network, password))

    androidCoreWrapperModule.checkIfDownloaded((fromJavaCode) => {
      if (fromJavaCode == false) {

        CustomLog("not downloaded", fromJavaCode)

        that.setState({ statusText2: "downloading bitcoind and tor..." });
        androidCoreWrapperModule.startDownload();
      } else {
        that.startBitcoinD();

      }
    })

  }
  async startBitcoinD() {
    this.setState({ bitcoinDTorDownloaded: true, bitcoinDStarted: true, statusText2: "starting bitcoind..." });
    const isRunning = await androidCoreWrapperModule.checkIfServiceIsRunning("com.mandelduck.androidcore.ABCoreService");

    CustomLog("is running", isRunning);
    if (isRunning) {


      CustomLog("service is running");
    } else {

      CustomLog("service is not running");
      androidCoreWrapperModule.cancelJob();

      androidCoreWrapperModule.cancelForeground();

      androidCoreWrapperModule.stopCore();

      androidCoreWrapperModule.registerBackgroundSync(false);


    }
  }

  stopAll(){
    const {LNDStarted,bitcoinDStarted } = this.state;
    if(LNDStarted){
CustomLog("stopping lnd");
    lndMobileWrapperModule.stopLND();
    this.setState({ lightningImage: lightningOff });
    }

    if(bitcoinDStarted){
      CustomLog("stopping bitcoind");
    androidCoreWrapperModule.cancelJob();

    androidCoreWrapperModule.cancelForeground();

    androidCoreWrapperModule.stopCore();
    }
    

    alert("you can now safely close the app, please reload the app inorder to restart the node")


  }
  reindex(){
    androidCoreWrapperModule.cancelJob();

      androidCoreWrapperModule.cancelForeground();

      androidCoreWrapperModule.stopCore();

      androidCoreWrapperModule.registerBackgroundSync(false);

      androidCoreWrapperModule.startCore(true);
  }
  async startLND() {

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

    this.setState({ statusText2: "connecting to LND..." })
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




  startTor() {
    this.setState({ hiddenServiceStarted: true, topStatusText: "starting hidden service..." });
    androidCoreWrapperModule.startTorHiddenService();
  }
  async startGetInfo() {

    CustomLog("start get info");

    const { startingServices, restURL, bitcoinDTorDownloaded, hiddenServiceStarted, bitcoinDStarted, bitcoinDSynced, startUpData, didSetConnect, LNDSynced } = this.state;

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
        that.setState({ lightningImage: lightningOn, showStop:true, LNDStarted:true });
 
      }

      let latestBlockHeight = startUpData.blockHeight;
      let currentBlockHeight = getInfoData.block_height;


      if (currentBlockHeight > startUpData.blockHeight) {
        var startUpDataTmp = startUpData;
        startUpDataTmp.blockHeight = currentBlockHeight;
        that.setState({ startUpData: startUpDataTmp })
      }

      if (currentBlockHeight == undefined) {
        that.setState({ statusText2: "starting up...", showSyncProgress: false, showStatus: true })

      } else {
        CustomLog("lbh",latestBlockHeight);

        CustomLog("cbh",currentBlockHeight);
        let progress = (currentBlockHeight / latestBlockHeight) * 100;
        CustomLog(currentBlockHeight / latestBlockHeight);
        CustomLog("pro",progress);
        var progressFormatted =  progress.toFixed(that.formatPercentage(progress)) + "%";


        CustomLog("prof",progressFormatted);

        if(progress >= 100){
          progressFormatted = "100%";
        }
 

        if (getInfoData.synced_to_chain == true) {

          if(startingServices == false){
         

    let tempData = that.state.activeData;

 
    tempData.unshift({ time:'Syncing', title: '', description: 'The app will now perform a full validation of the blockchain...' });
       
          that.setState({ activeData: tempData, startingServices:true, percentage: progressFormatted, syncProgress:progress, statusText1: "starting bitcoind...", statusText2: "initial sync complete"});

          that.loadServices();

         

          }
          return;
 
        }else{

        that.setState({ percentage: progressFormatted, syncProgress:progress, statusText2: "this should just take a few mins", statusText1: "initial sync"});
           
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
      date: "validating " + formattedTime,
      dateRaw: { day: day, month: month, year: year },
      blocks: "block\n" + blocks + "/" + headers,
      currentBlock: blocks,
      percentage: val.toFixed(this.formatPercentage(val)) + "%",
      val: val
    }

  }

  goToSettings() {
    this.props.navigation.navigate('Settings');
  }

  showConnection() {
    this.props.navigation.navigate('Connect');
  }

  render() {
    const { showStop, didSetConnect, activeData, percentage, syncProgress, progressSize, statusText1, statusText2, onionImage, lightningImage, bitcoindImage, } = this.state;
    return (
      <SafeAreaView style={styles.root}>


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
                    onAnimationComplete={() => console.log('onAnimationComplete')}
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
                  <Text style={styles.simpleButtonText}>stop</Text>
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
          </View>




        </View>



      </SafeAreaView>




    );
  }
}



export default HomeScreen;
