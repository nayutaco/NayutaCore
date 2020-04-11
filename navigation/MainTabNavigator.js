/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import { createAppContainer } from 'react-navigation';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import ConnectScreen from '../screens/Connect/ConnectScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const TabNavigator = createMaterialBottomTabNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <View>
            <Icon style={[{ color: tintColor }]} size={25} name={'home'} />
          </View>
        ),
      }
    },
    Connect: {
      screen: ConnectScreen,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <View>
            <Icon style={[{ color: tintColor }]} size={25} name={'qrcode'} />
          </View>
        ),
        activeColor: '#212121',
        inactiveColor: '#ffffff',
        barStyle: { backgroundColor: '#9ea6a9' },
      }
    },
    Settings: {
      screen: SettingsScreen,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <View>
            <Icon style={[{ color: tintColor }]} size={22} name={'cogs'} />
          </View>
        ),
        activeColor: '#212121',
        inactiveColor: '#ffffff',
        barStyle: { backgroundColor: '#9ea6a9' },
      }
    },
  },
  {
    initialRouteName: 'Home',
    activeColor: '#212121',
    inactiveColor: '#ffffff',
    barStyle: { backgroundColor: '#9ea6a9' },
  }
);

const tab = createAppContainer(TabNavigator);
export default tab;
