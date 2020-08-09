
//import React from 'react';
import styles from './SignInScreenStyles';
import React, { Component } from 'react'; 
import { GetUserPreferences, SetUserPreferences } from '../../tools/utils';
import CheckBox from '@react-native-community/checkbox';
import { WebView } from 'react-native-webview';

import {
  Animated,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'; 
const DID_SHOW_INTRO_KEY = "didShowIntroV1";
export default class SignInScreen extends Component {

  state = {
    intro1Loaded: false,
    intro2Loaded: false,
    intro3Loaded: false,
    intro4Loaded: false,
    showTerms: false,
    showDisclaimer: false,
    toggleCheckBox:false, 
  }

  async UNSAFE_componentWillMount() { 
    this.animatedValueText = new Animated.Value(0)
    this.animatedValueText2 = new Animated.Value(0)
    this.animatedValueView = new Animated.Value(0)
    this.animatedValueView2 = new Animated.Value(0) 

    this.animatedWelcomeView = new Animated.Value(0)
    this.animatedIntroView1 = new Animated.Value(0)
    this.animatedIntroView2 = new Animated.Value(0) 
    this.animatedIntroView3 = new Animated.Value(0) 
    this.animatedIntroView4 = new Animated.Value(0) 
    this.animatedIntroView5 = new Animated.Value(0) 
    this.animatedIntroView6 = new Animated.Value(0) 

    let that = this;

    setTimeout(function () {
      Animated.timing(that.animatedValueText, { toValue: 150, duration: 1500, useNativeDriver: true }).start()

    }, 2000);


    setTimeout(function () {
      Animated.timing(that.animatedValueText2, { toValue: 150, duration: 1500, useNativeDriver: true }).start()

    }, 4000);

    setTimeout(function () {
      Animated.timing(that.animatedValueView, { toValue: 150, duration: 1500, useNativeDriver: true }).start()

    }, 6000);

    setTimeout(function () {
      Animated.timing(that.animatedValueView2, { toValue: 150, duration: 1500, useNativeDriver: true }).start()

    }, 8000);
 
 
    
 
    const val = await GetUserPreferences(DID_SHOW_INTRO_KEY);
 
    if(val === "TRUE"){
    this.goToMainPage();
    }

  }
     
  static navigationOptions =
    {
      title: 'SecondActivity',
    };
  constructor(props) {
    super(props); 


  }

  goToIntro1() {

    Animated.timing(this.animatedWelcomeView, { toValue: 100, duration: 1000, useNativeDriver: true }).start()
    let that = this;
    setTimeout(function () {
      Animated.timing(that.animatedIntroView1, { toValue: 100, duration: 1000, useNativeDriver: true }).start()
      that.setState({ intro1Loaded: true })
    }, 1000);


  }

  goToIntro2() {
    Animated.timing(this.animatedWelcomeView, { toValue: 100, duration: 1000, useNativeDriver: true }).start()
    Animated.timing(this.animatedIntroView1, { toValue: 0, duration: 1000, useNativeDriver: true }).start()
    let that = this;
    setTimeout(function () {
      Animated.timing(that.animatedIntroView2, { toValue: 100, duration: 1000, useNativeDriver: true }).start()
      that.setState({ intro2Loaded: true })
    }, 1000);

  }


  goToIntro3() {
    Animated.timing(this.animatedIntroView2, { toValue: 0, duration: 1000, useNativeDriver: true }).start()
    
    let that = this;
    setTimeout(function () {
      Animated.timing(that.animatedIntroView3, { toValue: 100, duration: 1000, useNativeDriver: true }).start()
      that.setState({ intro3Loaded: true })
    }, 1000);

  }



  goToIntro4() {
    Animated.timing(this.animatedIntroView3, { toValue: 0, duration: 1000, useNativeDriver: true }).start()
    Animated.timing(this.animatedIntroView2, { toValue: 0, duration: 1000, useNativeDriver: true }).start()
    let that = this;
    setTimeout(function () {
      Animated.timing(that.animatedIntroView4, { toValue: 100, duration: 1000, useNativeDriver: true }).start()
      that.setState({ intro4Loaded: true })
    }, 1000);

  }

   

  async goToMainPage() {
    await SetUserPreferences(DID_SHOW_INTRO_KEY,"TRUE");
         
       
    this.props.navigation.navigate('Home');

  }

   showTerms() {
    Animated.timing(this.animatedIntroView4, { toValue: 0, duration: 1000, useNativeDriver: true }).start()
    let that = this;
    setTimeout(function () {
      Animated.timing(that.animatedIntroView5, { toValue: 100, duration: 1000, useNativeDriver: true }).start()
      that.setState({ showTerms: true })
    }, 1000);
  }

  showDisclaimer() {
    Animated.timing(this.animatedIntroView5, { toValue: 0, duration: 1000, useNativeDriver: true }).start()
    let that = this;
    setTimeout(function () {
      Animated.timing(that.animatedIntroView6, { toValue: 100, duration: 1000, useNativeDriver: true }).start()
      that.setState({ showDisclaimer: true })
    }, 1000);
  }
  setToggleCheckBox(val){
    this.setState({toggleCheckBox:val});
  }
  render() {

    const interpolateColorText = this.animatedValueText.interpolate(
      {
        inputRange: [0, 150],
        outputRange: [0, 1]
      }
    )
    const animatedFadeText = { opacity: interpolateColorText }



    const interpolateColorText2 = this.animatedValueText2.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedFadeText2 = { opacity: interpolateColorText2 }


    const interpolateColorView = this.animatedValueView.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedFadeView = { opacity: interpolateColorView }




    const interpolateColorView2 = this.animatedValueView2.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedFadeView2 = { opacity: interpolateColorView2 }

    const interpolateWelcomeView = this.animatedWelcomeView.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [1, 0]
      }
    )
    const animatedWelcomeView = { opacity: interpolateWelcomeView }


    const interpolateIntroView1 = this.animatedIntroView1.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedIntroView1 = { opacity: interpolateIntroView1 }

    const interpolateIntroView2 = this.animatedIntroView2.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedIntroView2 = { opacity: interpolateIntroView2 }

    const interpolateIntroView3 = this.animatedIntroView3.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedIntroView3 = { opacity: interpolateIntroView3 }

    const interpolateIntroView4 = this.animatedIntroView4.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedIntroView4 = { opacity: interpolateIntroView4 }



    const interpolateIntroView5 = this.animatedIntroView5.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedIntroView5 = { opacity: interpolateIntroView5 }

     

    const interpolateIntroView6 = this.animatedIntroView6.interpolate(
      {
        inputRange: [0, 100],
        outputRange: [0, 1]
      }
    )
    const animatedIntroView6= { opacity: interpolateIntroView6 }

     


    const {toggleCheckBox,showTerms, showDisclaimer, intro1Loaded, intro2Loaded, intro3Loaded, intro4Loaded} = this.state;

    return (

      <View style={styles.container}>


        <Animated.View style={[styles.welcomeContainer, animatedWelcomeView]}>
          <View style={styles.centerContainer}>
            <Animated.Text style={[styles.subTitle, animatedFadeText]}>welcome to</Animated.Text>
            <Animated.Image source={require('../../assets/images/boxIcon.png')}
              style={[styles.boxImage, animatedFadeText2]} />
            <Animated.View style={animatedFadeView} >
              <Animated.Text style={[styles.byNayuta]} >by </Animated.Text>
              <Image source={require('../../assets/images/icon_logo_white.png')}
                style={styles.welcomeImage} />


            </Animated.View >


          </View>
          <Animated.View style={[styles.buttonsContainer, animatedFadeView2]}>

            <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToIntro2.bind(this)}>
              <Text style={styles.simpleButtonText}>continue</Text>
            </TouchableOpacity>

          </Animated.View>


        </Animated.View>


        
        {intro1Loaded &&

          <Animated.View style={[styles.intro1Container, animatedIntroView1]}>

            <Text style={[styles.introTitle]}>Why Bitcoin Fullnode?</Text>
            <View style={styles.centerContainer}>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/privacyIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Do not trust, verify</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/nodeIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Full Bitcoin and Lightning experience</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/decentralizedIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Keep Bitcoin decentralized</Text>
              </View>


            </View>
            <View style={[styles.buttonsContainer]}>

              <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToIntro2.bind(this)}>
                <Text style={styles.simpleButtonText}>continue</Text>
              </TouchableOpacity>

            </View>


          </Animated.View>
        }
        {intro2Loaded &&

          <Animated.View style={[styles.intro1Container, animatedIntroView2]}>

            <Text style={[styles.introTitle]}>What NayutaCore does?</Text>
            <View style={styles.centerContainer}>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/ninjaIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Fullnode for everyone. No coding required</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/syncIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Run your own node 24/7</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/appLinkIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Connect to other wallets and lapps</Text>
              </View>


              <View style={styles.introItem}>
                <Image source={require('../../assets/images/chartIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Keep up with the latest Bitcoin block data</Text>
              </View>

              
            </View>
            <View style={[styles.buttonsContainer]}>

              <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToIntro4.bind(this)}>
                <Text style={styles.simpleButtonText}>next</Text>
              </TouchableOpacity>

            </View>


          </Animated.View>
        }

{intro3Loaded &&

<Animated.View style={[styles.intro1Container, animatedIntroView3]}>

  <Text style={[styles.introTitle]}>Recommended setup</Text>
   
  
  <View style={styles.centerContainerLess}>
  <Text style={styles.infoTextTop}>
  The Bitcoin blockchain synchronization takes up some bandwidth and memory.
  </Text>
    <View style={styles.introItem}>
      <Image source={require('../../assets/images/wifiIcon.png')}
        style={styles.introItemImage} />
      <Text style={[styles.introItemText]}>Plug in</Text>
    </View>

    <View style={styles.introItem}>
      <Image source={require('../../assets/images/awakeIcon.png')}
        style={styles.introItemImage} />
      <Text style={[styles.introItemText]}>Connect to WIFI</Text>
    </View>

    <View style={styles.introItem}>
      <Image source={require('../../assets/images/powerIcon.png')}
        style={styles.introItemImage} />
      <Text style={[styles.introItemText]}>Kill other unused apps</Text>
    </View>


  </View>
  <View style={[styles.buttonsContainer]}>

    <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToIntro4.bind(this)}>
      <Text style={styles.simpleButtonText}>continue</Text>
    </TouchableOpacity>

  </View>


</Animated.View>
}

{intro4Loaded &&

<Animated.View style={[styles.intro1Container, animatedIntroView4]}>

  <Text style={[styles.introTitle]}></Text>
  <View style={styles.centerContainer}>
  <Text style={styles.infoText}>
  The initial blockchain sync typically takes 4 to 5 days.
  
  </Text>
  <Text style={styles.infoText}>
  Once complete, you'll be able to connect your node to other services...
  </Text>

  <Text style={styles.infoText}>
 And start enjoying the benefits of running a full node.
  </Text>
  </View>
  <View style={[styles.buttonsContainer]}>

    <TouchableOpacity style={[styles.simpleButton]} onPress={this.showTerms.bind(this)}>
      <Text style={styles.simpleButtonTextSmall}>Next</Text>
    </TouchableOpacity>

  </View>


</Animated.View>
}


{showTerms &&

<Animated.View style={[styles.intro1Container, animatedIntroView5]}>


<WebView
        originWhitelist={['*']}
        source={{html: require('./../../assets/terms.js')()}}
        style={[styles.webView]}
      />
     {/* 
  <Text style={[styles.introTitle]}>Terms and Conditions</Text>
  <View style={styles.centerContainer}>
  <Text style={styles.infoText}>
  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
  </Text>
   
 
     </View>*/}
  <View style={[styles.buttonsContainer]}>

  
    <TouchableOpacity style={[styles.roundedButton]} onPress={this.showDisclaimer.bind(this)}>
      <Text style={styles.simpleButtonTextSmallWhite}>I have read and agree</Text>
    </TouchableOpacity>

  </View>


</Animated.View>
}


{showDisclaimer &&

<Animated.View style={[styles.intro1Container, animatedIntroView6]}>

  <Text style={[styles.introTitle]}>Disclaimer</Text>
  <View style={styles.centerContainer}>
  <Text style={styles.infoText}> 
Nayuta Core is in beta and is provided on an "as is" basis.{"\n\n"}
Bugs are expected and loss of fund while using the app may occur.{"\n\n"}
We cannot be responsible for the potential damage caused by app malfunctioning and/or failure to backup the fund.{"\n\n"}
Use at your own sole risk.
  </Text>
   
 
  </View>
  <View style={{flexDirection:"row"}}>
  <CheckBox
    disabled={false}
    value={toggleCheckBox}
    onValueChange={(newValue) => this.setToggleCheckBox(newValue)}
  />
  <Text style={styles.toggleText}> 
  I understand
  </Text>
  </View>
{toggleCheckBox &&
  <View style={[styles.buttonsContainer]}>

    <TouchableOpacity style={[styles.roundedButton]} onPress={this.goToMainPage.bind(this)}>
      <Text style={styles.simpleButtonTextSmallWhite}>Begin</Text>
    </TouchableOpacity>

  </View>
}


</Animated.View>
}



      </View>
    );


  }

}




