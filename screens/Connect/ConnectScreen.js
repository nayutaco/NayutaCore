import React, { Component } from 'react';
import styles from './ConnectScreenStyles';
import QRCode from 'react-native-qrcode-svg';
import { Icon } from 'react-native-elements'
import {
  Image,
  NativeModules,
  ActivityIndicator,
  Text,
  Dimensions,
  TouchableOpacity,
  View,
  Clipboard
} from 'react-native';

import { GetGlobalInfo, CustomLog } from '../../tools/utils';
const lndMobileWrapperModule = NativeModules.LNDMobileWrapper;

export default class ConnectScreen extends Component {

  state = {
    network:"mainnet",
    showWaitMessage: false,
    showQRCode: false,
    lndConnectURI: "",
    qrCodeSize: Dimensions.get('window').width * 0.8,
    showInstructions: true

  }

  constructor(props) {
    super(props);

  }


  hideInstructions = async () => {
    this.setState({ showInstructions: false })
  }
  showInstructionsFunc = async () => {
    this.setState({ showInstructions: true })
  }
  getLNDConnectURI() {
    const {network } = this.state;

    var that = this;
    
    lndMobileWrapperModule.getLNDConnectURI(network, (fromJavaCode) => {
      let res = JSON.parse(fromJavaCode);
      CustomLog("getLNDConnectURI", res);
      that.setState({ lndConnectURI: res.uri, showQRCode: true });


    })
  }
  writeToClipboard = async () => {
    await Clipboard.setString(this.state.lndConnectURI);
    alert('Copied to Clipboard');

  };

  componentDidMount() {
    this.load()
    this.props.navigation.addListener('willFocus', this.load)

  }
  load = () => {

    if (GetGlobalInfo().canShowConnectCode) {
      this.setState({ showWaitMessage: false });
      if(this.state.lndConnectURI.length == 0){
    

      this.getLNDConnectURI();
      }
    } else {
      this.setState({ showWaitMessage: true });
    }

  }

  render() { 
    let logoFromFile = require('../../assets/images/nayutaLogo.png');
    const { showInstructions, lndConnectURI, qrCodeSize, showWaitMessage, showQRCode } = this.state;

    return (
      <View >
        <View style={styles.container}>

          {!showWaitMessage &&
            <View style={[styles.innerView]}>

              <View style={[styles.qrCodeInstructionsTop]} >

                <Image style={[styles.instructionsIcon]} source={require('../../assets/images/linkIcon.png')} />
                <Text style={[styles.instructionsSubtitle]}>remotely connect to your full node</Text>
              </View>


              <View style={[styles.qrCodeView]}>
                <TouchableOpacity onPress={this.writeToClipboard}>
                  {!showQRCode && !showWaitMessage &&

                    <ActivityIndicator size='large' style={[styles.spinner]} />
                  }

                  {showQRCode &&
                    <QRCode style={[styles.qrCode]}
                      size={qrCodeSize}
                      value={lndConnectURI}
                      logo={logoFromFile}
                      logoSize={100}
                      logoBackgroundColor='transparent'
                      onPress={this.writeToClipboard}
                    />
                  }

                </TouchableOpacity>

                <View>
                  <View style={[styles.qrCodeInstructions]} ><Text style={[styles.subtitle]}>scan with your Zeus wallet</Text>
                    <Image style={[styles.walletIcon]} source={require('../../assets/images/zeusIcon.png')} /></View>
                </View>


              </View>

            </View>
          }
          {showWaitMessage &&
            <View style={[styles.innerView]}>

              <Text style={[styles.connectionWarning]}>connection instructions will show once initial sync has completed</Text>
            </View>
          }


        </View>
        {showInstructions &&
          <View style={[styles.explainView]}>
            <View style={[styles.explainInnerView]}>
              <Text style={[styles.explainItemTitle]}>Connect to your node</Text>
              <View style={[styles.explainItemSeperator]}></View>
              <Text style={[styles.explainItemText]}>You can scan the qrcode or tap to copy the config URI shown on this page inorder to connect this node to 3rd part apps such as Zeus Wallet</Text>


              <View style={[styles.explainItemButton]}>
                <TouchableOpacity onPress={this.hideInstructions}>

                  <Text style={[styles.explainItemButtonText]}>ok </Text>
                </TouchableOpacity>

              </View>



            </View>
          </View>
        }

        <View style={[styles.helpButton]}>
          <TouchableOpacity onPress={this.showInstructionsFunc}>
            <Icon ize={50} color={'rgba(130,130,130,1)'}
              name='info' />

          </TouchableOpacity>
        </View>
      </View >

    )

  }
}
