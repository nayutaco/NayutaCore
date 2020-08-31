import React, { Component } from 'react';
import styles from './ConnectScreenStyles';
import QRCode from 'react-native-qrcode-svg';
import { Icon } from 'react-native-elements'
import { GetUserPreferences } from '../../tools/utils';
import SegmentedControl from '@react-native-community/segmented-control';

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
    lndConnectURI: "",
    selectedIndex: 0,
    network: "",
    showWaitMessage: false,
    showQRCodeView: false,
    showQRCode: false,
    remoteRESTConnectURI: " ",
    localRESTConnectURI: " ",
    localGRPCConnectURI: " ",
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
    const { network } = this.state;

    var that = this;
    CustomLog("network is", network);
    lndMobileWrapperModule.getLNDConnectURI(network, (fromJavaCode) => {
      CustomLog("got uri", fromJavaCode);
      let res = JSON.parse(fromJavaCode);
      CustomLog("getLNDConnectURI", res);

      let remoteRESTConnectURI = res.uri;

      var localConnectURIParts = remoteRESTConnectURI.split("?");

      var cert = localConnectURIParts[1];
      cert = cert.replace("==", "");
      cert = cert.replace(/\+/g, "-");
      cert = cert.replace(/\//g, "_");

      var localGRPCConnectURI = "lndconnect://127.0.0.1:10009?" + cert;


      var localRESTConnectURI = "lndconnect://127.0.0.1:8080?" + cert;


      that.setState({ remoteRESTConnectURI: remoteRESTConnectURI, localRESTConnectURI: localRESTConnectURI, localGRPCConnectURI: localGRPCConnectURI });


    })
  }

  showQRCodeView(type) {

    const { remoteRESTConnectURI, localRESTConnectURI, localGRPCConnectURI } = this.state;
    CustomLog("type is", type);

    if (type == "rest-local") {
      CustomLog("rest local", localRESTConnectURI);
      this.setState({ lndConnectURI: localRESTConnectURI }, function () {
      this.writeToClipboard();
      });
    }
    else if (type == "grpc-local") {
      CustomLog("grpc local", localGRPCConnectURI);
      this.setState({ lndConnectURI: localGRPCConnectURI }, function () {
        this.writeToClipboard();
        });
    }
    else if (type == "rest-remote") {
      CustomLog("rest remote", remoteRESTConnectURI);
      this.setState({ showQRCode: true, lndConnectURI: remoteRESTConnectURI, showQRCodeView: true });
    }
    

  }


  closeQRCodeView() {


    this.setState({ showQRCode: false, showQRCodeView: false });


  }

  writeToClipboard = async () => {
    if(this.state.lndConnectURI.length > 0){
    await Clipboard.setString(this.state.lndConnectURI);
    alert('Copied to Clipboard');
    }else{
      alert('not ready yet');
    }

  };

  async componentDidMount() {
    const network = await GetUserPreferences("network", "mainnet");
    this.setState({ network: network })
    this.load()
    this.props.navigation.addListener('willFocus', this.load)

  }
  load = () => {

    if (GetGlobalInfo().canShowConnectCode) {
      this.setState({ showWaitMessage: false });
      if (this.state.lndConnectURI.length == 0) {


        this.getLNDConnectURI();
      }
    } else {
      this.setState({ showWaitMessage: true });
    }

  }

  render() {
    let logoFromFile = require('../../assets/images/nayutaLogo.png');
    const { showInstructions, lndConnectURI, qrCodeSize, showWaitMessage, showQRCodeView, showQRCode } = this.state;

    return (
      <View >
        <View style={styles.container}>

          {!showWaitMessage &&
            <View style={[styles.innerView]}>

              <View style={[styles.localConnect]} >


                <Text style={[styles.title]}>Local Connect</Text>
                <Text style={[styles.subTitle]}>connect 3rd party apps running on the same device</Text>
                <View style={[styles.iconsView]}>
                  <TouchableOpacity onPress={() => this.showQRCodeView("rest-local")}>
                    <Image style={[styles.appIcon]} source={require('../../assets/images/zeusIcon.png')} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.showQRCodeView("grpc-local")}>
                    <Image style={[styles.appIcon]} source={require('../../assets/images/zap-icon-128.png')} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.title]}>Remote Connect</Text>
                <Text style={[styles.subTitle]}>connect 3rd party apps running on another device</Text>
                <View style={[styles.iconsView]}>
                  <TouchableOpacity onPress={() => this.showQRCodeView("rest-remote")}>
                    <Image style={[styles.appIcon]} source={require('../../assets/images/zeusIcon.png')} />
                  </TouchableOpacity>
                </View>

              </View>


              {showQRCodeView &&

                <View style={[styles.qrCodeView]}>


                  {!showQRCode &&
                    <ActivityIndicator size='large' style={[styles.spinner]} />
                  }

                  {showQRCode &&
                    <View>
                      <TouchableOpacity onPress={this.writeToClipboard}>
                        <QRCode style={[styles.qrCode]}
                          size={qrCodeSize}
                          value={lndConnectURI}
                          logo={logoFromFile}
                          logoSize={100}
                          logoBackgroundColor='transparent'
                          onPress={this.writeToClipboard}
                        />


                      </TouchableOpacity>


                      <View>

                        <View style={[styles.qrCodeInstructions]} >
                          <Text style={[styles.subtitle]}>tap to copy</Text>

                        </View>
                        <View style={[styles.qrCodeInstructions]} >

                          <TouchableOpacity style={[styles.roundedButton]} onPress={this.closeQRCodeView.bind(this)}>
                            <Text style={styles.simpleButtonText}>close</Text>
                          </TouchableOpacity>
                        </View>





                      </View>
                    </View>}


                </View>}

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
              <Text style={[styles.explainItemText]}>Select which app you want to connect to and either copy and past the config into that app or scan the qrcode</Text>


              <View style={[styles.explainItemButton]}>
                <TouchableOpacity onPress={this.hideInstructions}>

                  <Text style={[styles.explainItemButtonText]}>ok</Text>
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
