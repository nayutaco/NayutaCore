import React from 'react';
import { createAppContainer,createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import MainTabNavigator from './MainTabNavigator'; 
import SignInScreen from '../screens/SignIn/SignInScreen';


import SettingsScreen from '../screens/Settings/SettingsScreen';

import ConnectScreen from '../screens/Connect/ConnectScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import InstructionsScreen from '../screens/Instructions/InstructionsScreen';


const AppNavigator = createStackNavigator({
  // You could add another route here for authentication.
  // Read more at https://reactnavigation.org/docs/en/auth-flow.html

  Intro: {
    screen: SignInScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Settings: {
    screen: SettingsScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Connect: {
    screen: ConnectScreen,
    navigationOptions: {
      headerShown: false,
    },
  },
  Instructions: {
    screen: InstructionsScreen,
    navigationOptions: {
      headerShown: false,
    },
  },

})

const App = createAppContainer(AppNavigator);

export default App;

