
//import React from 'react';
import styles from './SignInScreenStyles';
import React, { Component } from 'react';
import I18n from '../../i18n';
import { GetUserPreferences, SetUserPreferences } from '../../tools/utils';

import {
  Animated,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


export default class SignInScreen extends Component {

  state = {
    intro1Loaded: false,
    intro2Loaded: false,
    intro3Loaded: false
  }

  UNSAFE_componentWillMount() {
    this.animatedValueText = new Animated.Value(0)
    this.animatedValueText2 = new Animated.Value(0)
    this.animatedValueView = new Animated.Value(0)
    this.animatedValueView2 = new Animated.Value(0)
    this.animatedValueView3 = new Animated.Value(0)

    this.animatedWelcomeView = new Animated.Value(0)
    this.animatedIntroView1 = new Animated.Value(0)
    this.animatedIntroView2 = new Animated.Value(0)
    this.animatedIntroView3 = new Animated.Value(0)



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

    setTimeout(function () {
      Animated.timing(that.animatedValueView3, { toValue: 150, duration: 1500, useNativeDriver: true }).start()

    }, 8000);

    var that = this;

    GetUserPreferences("skipIntroV1", function (result) {
      if (result === "true") {
        SetUserPreferences("skipIntroV1", "false", function () {
          this.props.navigation.navigate('Tabs');
         // that.props.navigation.navigate.goBack(null);

        });


      }

    });




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

  goToMainPage() {

    this.props.navigation.navigate('Tabs');

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


    const { intro1Loaded, intro2Loaded, intro3Loaded } = this.state;

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

            <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToIntro1.bind(this)}>
              <Text style={styles.simpleButtonText}>continue</Text>
            </TouchableOpacity>

          </Animated.View>


        </Animated.View>


        {intro1Loaded &&
          <Animated.View style={[styles.intro1Container, animatedIntroView1]}>
            <Text style={[styles.introTitle]}>What is the box?</Text>

            <View style={styles.centerContainer}>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/nodeIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Full Bitcoin and Lightning node that verifies the complete blockchain</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/connectIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Connects directly to the bitcoin and lightning network</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/privacyIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Preservers privacy and does not rely on 3rd party services</Text>
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

            <Text style={[styles.introTitle]}>How do I use it?</Text>
            <View style={styles.centerContainer}>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/powerIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Plug in to your power socket</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/wifiIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Connect to your wifi connect</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/awakeIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Disable auto sleep in the app settings</Text>
              </View>


            </View>
            <View style={[styles.buttonsContainer]}>

              <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToIntro3.bind(this)}>
                <Text style={styles.simpleButtonText}>continue</Text>
              </TouchableOpacity>

            </View>


          </Animated.View>
        }
        {intro3Loaded &&

          <Animated.View style={[styles.intro1Container, animatedIntroView3]}>

            <Text style={[styles.introTitle]}>Let's get started</Text>
            <View style={styles.centerContainer}>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/infoIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Visit the settings tab to find in-depth instructions on how to keep your device always on</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/syncIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Next the app will start your lightning wallet and perform an initial sync</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/appLinkIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Once initial sync has completed you can link to this node using various 3rd party apps</Text>
              </View>


            </View>
            <View style={[styles.buttonsContainer]}>

              <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToMainPage.bind(this)}>
                <Text style={styles.simpleButtonText}>begin</Text>
              </TouchableOpacity>

            </View>


          </Animated.View>
        }



      </View>
    );


  }

}




