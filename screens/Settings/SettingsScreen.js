import React, { Component } from 'react';
import styles from './SettingsScreenStyles';
import AppStyles from '../../AppStyles';
import { Icon } from 'react-native-elements'
import * as Keychain from 'react-native-keychain';
import { encrypt, decrypt } from 'react-native-simple-encryption';
import { CustomLog, CustomError, GetUserPreferences, SetUserPreferences } from '../../tools/utils';
import DeviceInfo from 'react-native-device-info';

import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';

import { MonoText } from '../../components/StyledText';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default class OnChainScreen extends Component {

state = {
  otherNetwork:""
}
  constructor(props) {
    super(props);
   
  }

  showInstructions() {

    this.props.navigation.navigate('Instructions')

  }

async componentDidMount(){
  const network = await GetUserPreferences("network","mainnet");
  if(network === "mainnet"){
    this.setState({otherNetwork:"testnet"});
  }else{
    this.setState({otherNetwork:"mainnet"});
  }


}
  exportXPub() {
    alert("coming soon");

  }

  async changeNetwork(){
   
    if(this.state.otherNetwork === "mainnet"){
     await SetUserPreferences("network","mainnet");
     this.setState({otherNetwork:"testnet"})
    }else{
      await SetUserPreferences("network","testnet");
      this.setState({otherNetwork:"mainnet"})
    }


    alert("please restart the app and stop any background processes for changes to take effect")
  }

  reindex() {
    alert("coming soon");
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
  async showPassphrase() {

    var password = await this.getPassword();

    console.log("password",password)

    let result = await GetUserPreferences("passphrase")
    console.log("passphrase",result )
    let passphrase = decrypt(password, result)
    if(passphrase === ""){
      alert("a passphrase will be generated once the intial sync has completed");
    }else{
      alert(passphrase);
    }
   



  }



  render() {

    const {otherNetwork} = this.state;
    
    return (
      <View style={[styles.backgroundView]}>

        <TouchableOpacity onPress={this.showInstructions.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>always on instructions</Text>

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

        <TouchableOpacity onPress={this.exportXPub.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>re-index bitcoind </Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.reindex.bind(this)}>
          <View style={[styles.menuItem]}>

            <View style={[styles.menuItemInner]}>
              <Text style={[styles.menuText]}>export xpub </Text>

            </View>
            <View style={[styles.iconView]}>
              <Icon size={50} color={'rgba(130,130,130,1)'}
                name='keyboard-arrow-right' />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={[styles.versionText]}>ver {DeviceInfo.getVersion()} </Text>
      </View>

    )

  }
}
