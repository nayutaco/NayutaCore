
//import React from 'react';
import styles from './InstructionsScreenStyles';
import React, { Component } from 'react';
import I18n from '../../i18n';
import {
  Animated,
  NativeModules,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const animationSpeed = 300;

export default class InstructionsScreen extends Component {

  state = {
    instruction1Loaded: true,
    instruction2Loaded: false,
    instruction3Loaded: false
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
    var that = this;


    this.goToInstruction1();

  }

  static navigationOptions =
    {
      title: 'SecondActivity',
    };
  constructor(props) {
    super(props);


  }

  goToInstruction1() {

    Animated.timing(this.animatedWelcomeView, { toValue: 100, duration: animationSpeed, useNativeDriver: true }).start()
    let that = this;
    setTimeout(function () {

      Animated.timing(that.animatedIntroView1, { toValue: 100, duration: animationSpeed, useNativeDriver: true }).start()

      that.setState({ instruction1Loaded: true })
    }, animationSpeed);


  }

  goToInstruction2() {
    Animated.timing(this.animatedIntroView1, { toValue: 0, duration: animationSpeed, useNativeDriver: true }).start()
    let that = this;
    setTimeout(function () {
      Animated.timing(that.animatedIntroView2, { toValue: 100, duration: animationSpeed, useNativeDriver: true }).start()
      that.setState({ instruction2Loaded: true })
    }, animationSpeed);

  }

  goToInstruction3() {
    Animated.timing(this.animatedIntroView2, { toValue: 0, duration: animationSpeed, useNativeDriver: true }).start()
    let that = this;
    setTimeout(function () {
      Animated.timing(that.animatedIntroView3, { toValue: 100, duration: animationSpeed, useNativeDriver: true }).start()
      that.setState({ instruction3Loaded: true })
    }, animationSpeed);

  }

  closePage() {

    this.props.navigation.goBack(null);

  }

  connectExistingWallet() {
    Alert.alert('not yet available')
  }


  render() {

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


    const { instruction1Loaded, instruction2Loaded, instruction3Loaded } = this.state;

    return (

      <View style={styles.container}>





        {instruction1Loaded &&
          <Animated.View style={[styles.intro1Container, animatedIntroView1]}>
            <Text style={[styles.introTitle]}>1. Enable developer options</Text>

            <View style={styles.introItemTop}>
              <Text style={[styles.introItemTextTop]}>Depending on your device these instructions may not be accurate, if so you will need to search online device specific information</Text>
            </View>


            <View style={styles.centerContainer}>



              <View style={styles.introItem}>
                <Image source={require('../../assets/images/settingsIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Navigate to Settings > About Phone > Build Number</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/tapIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Tap the build number 7 times</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/developerIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Developer options should now be found under Settings > System > Advanced > Developer Options</Text>
              </View>


            </View>

            <View style={[styles.buttonsContainer]}>

              <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToInstruction2.bind(this)}>
                <Text style={styles.simpleButtonText}>continue</Text>
              </TouchableOpacity>

            </View>


          </Animated.View>
        }
        {instruction2Loaded &&

          <Animated.View style={[styles.intro1Container, animatedIntroView2]}>

            <Text style={[styles.introTitle]}>2. Enable 'Stay Awake'</Text>
            <View style={styles.centerContainer}>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/developerIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Navigate to Settings > System > Advanced > Developer Options</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/awakeIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Find and set 'Stay Awake' to on</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/unlockIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>You may also need to disable auto lock in and sleep in your display/lock settings</Text>
              </View>


            </View>
            <View style={[styles.buttonsContainer]}>

              <TouchableOpacity style={[styles.simpleButton]} onPress={this.goToInstruction3.bind(this)}>
                <Text style={styles.simpleButtonText}>continue</Text>
              </TouchableOpacity>

            </View>


          </Animated.View>
        }
        {instruction3Loaded &&

          <Animated.View style={[styles.intro1Container, animatedIntroView3]}>

            <Text style={[styles.introTitle]}>3. Adjust Display</Text>
            <View style={styles.centerContainer}>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/brightnessIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Adjust your brightness to as low as possible</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/powerIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Make sure your device is connected to a constant power supply</Text>
              </View>

              <View style={styles.introItem}>
                <Image source={require('../../assets/images/wifiIcon.png')}
                  style={styles.introItemImage} />
                <Text style={[styles.introItemText]}>Make sure your device is connected to a stable wifi connection</Text>
              </View>




            </View>
            <View style={[styles.buttonsContainer]}>
              <TouchableOpacity style={[styles.simpleButton]} onPress={this.closePage.bind(this)}>
                <Text style={styles.simpleButtonText}>close</Text>
              </TouchableOpacity>

            </View>


          </Animated.View>
        }



      </View>
    );


  }

}




