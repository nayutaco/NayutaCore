import React, { Component } from 'react';
import styles from './SettingsScreenStyles'; 
import { Icon } from 'react-native-elements'
import * as Keychain from 'react-native-keychain'; 
import { GetGlobalInfo, CustomLog, GetUserPreferences, SetUserPreferences } from '../../tools/utils';
import DeviceInfo from 'react-native-device-info';
import DialogInput from 'react-native-dialog-input';

import {
  NativeModules,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  Alert,
} from 'react-native';
 
const lndMobileWrapperModule = NativeModules.LNDMobileWrapper;
const androidCoreWrapperModule = NativeModules.AndroidCoreWrapper;
export default class OnChainScreen extends Component {

  state = {
    isDialogVisible: "",
    otherNetwork: "",
    alwaysBackend: false,
    alwaysBackendText: "always use neutrino",
    unlimitedModeStr: "",
    enableTorStr: ""
  }
  constructor(props) {
    super(props);

  }

  showInstructions() {

    this.props.navigation.navigate('Instructions')

  }

  async componentDidMount() {
    const network = await GetUserPreferences("network", "mainnet");
    if (network === "mainnet") {
      this.setState({ network: network, otherNetwork: "testnet" });
    } else {
      this.setState({ network: network, otherNetwork: "mainnet" });
    }


    const backend = await GetUserPreferences("alwaysNeutrinoBackend");
    if (backend === "true") {
      this.setState({ alwaysBackend: true, alwaysBackendText: "disable always use neutrino" });
    } else {
      this.setState({ alwaysBackend: false, alwaysBackendText: "always use neutrino" });
    }


    this.setTorStr();

    this.setUnlimitedStr();

  }
  exportXPub() {
    alert("coming soon");

  }


  async setTorStr() {
    const tor = await GetUserPreferences("enableTor", "false");

    if (tor === "true") {
      this.setState({ enableTorStr: "disable onion routing" })
    } else {
      this.setState({ enableTorStr: "enable onion routing" })
    }


  }
  async setUnlimitedStr() {
    let isUnlimitedMode = await GetUserPreferences("unlimitedMode") === "TRUE" ? true : false;
    str = "allow sync using mobile data";
    if (isUnlimitedMode) {
      str = "disable sync using mobile data";

    }
    this.setState({ unlimitedModeStr: str });
  }
  async UpdateNeutrinoServer(address) {
    console.log(address);

    await SetUserPreferences("neutrinoPeer", address);

    this.setState({ isDialogVisible: false });

    alert("please restart the app for changes to take effect")

  }
  async changeNetwork() {

    if (this.state.otherNetwork === "mainnet") {
      await SetUserPreferences("network", "mainnet");
      this.setState({ otherNetwork: "testnet" })
    } else {
      await SetUserPreferences("network", "testnet");
      this.setState({ otherNetwork: "mainnet" })
    }

    this.stopServices();

    alert("please restart the app and stop any background processes for changes to take effect")

  }

  async changeBackend() {

    if (this.state.alwaysBackend == true) {
      await SetUserPreferences("alwaysNeutrinoBackend", "");
      this.setState({ alwaysBackend: false, alwaysBackendText: "always use neutrino" })
    } else {
      await SetUserPreferences("alwaysNeutrinoBackend", "true");
      this.setState({ otherBackend: true, alwaysBackendText: "disable always use neutrino" })
    }

    this.stopServices();
    alert("please restart the app and stop any background processes for changes to take effect")
  }

  reindex() {
    alert("coming soon");
  }

  exportLogs() {

    const { network } = this.state;
    var globalInfo = GetGlobalInfo();
    lndMobileWrapperModule.ExportLogs(network, globalInfo.lndGetInfo);

  }


  stopServices() {
    androidCoreWrapperModule.cancelJob();

    androidCoreWrapperModule.cancelForeground();

    androidCoreWrapperModule.stopCore();

  }
  async showPubKey() {

    var globalInfo = GetGlobalInfo();
    var getInfo = JSON.parse(globalInfo.lndGetInfo);
    console.log(globalInfo);
    if (globalInfo == undefined || getInfo == undefined) {
      alert("please try again after LND has synced")
    } else {

      var pubkey = getInfo.identity_pubkey;
      await Clipboard.setString(pubkey);
      alert(pubkey + ' Copied to Clipboard');
    }


  }

  async setTor() {
    const tor = await GetUserPreferences("enableTor", "false");

    if (tor === "true") {
      await SetUserPreferences("enableTor", "false")
    } else {
      await SetUserPreferences("enableTor", "true")
    }

    this.setTorStr();

    alert("please restart the app for changes to take effect");

  }
  async setUnlimitedMode() {
    var actionStr = "SET";


    let unlimitedMode = await GetUserPreferences("unlimitedMode") === "TRUE" ? true : false;

    if (unlimitedMode) {
      actionStr = "DISABLE"
    }
    Alert.alert(
      "use mobile data for sync",
      "allow bitcoin d to sync via wifi and mobile data",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: actionStr, onPress: async () => {

            if (unlimitedMode) {
              await SetUserPreferences("unlimitedMode", "")
            } else {
              await SetUserPreferences("unlimitedMode", "TRUE")
            }
            this.setUnlimitedStr();


          }
        }
      ],
      { cancelable: false })


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

  async setNeutrinoServer() {
    this.setState({ isDialogVisible: true });

  }


  async showPassphrase() {

    var password = await this.getPassword();

    console.log("password", password)

    let result = await GetUserPreferences("passphrase")
    console.log("passphrase", result)
    let passphrase = decrypt(password, result)
    if (passphrase === "") {
      alert("a passphrase will be generated once the intial sync has completed");
    } else {
      alert(passphrase);
    }




  }



  render() {

    const { enableTorStr, unlimitedModeStr, otherNetwork, alwaysBackendText } = this.state;

    return (
      <View style={[styles.backgroundView]}>
        <TouchableOpacity onPress={this.setNeutrinoServer.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>set neutrino server </Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.showPassphrase.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>show recovery phrase </Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.changeNetwork.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>set {otherNetwork} </Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.setUnlimitedMode.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>{unlimitedModeStr}</Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.setTor.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>{enableTorStr}</Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.showPubKey.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>show pubkey</Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.exportLogs.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>export logs </Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={[styles.versionText]}>ver {DeviceInfo.getVersion()} </Text>
        <DialogInput isDialogVisible={this.state.isDialogVisible}
          title={"enter the address for the neutrino server"}
          message={"this will force LND to connect to a single neutrino server, set nothing to disable this"}
          hintInput={"enter address"}
          submitInput={(inputText) => { this.UpdateNeutrinoServer(inputText) }}
          closeDialog={() => { this.setState({ isDialogVisible: false }) }}>
        </DialogInput>
      </View>
 
    )

  }
}
