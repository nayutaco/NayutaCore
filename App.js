/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react'; 
import HomeScreen from './screens/Home/HomeScreen';
import AppNavigator from './navigation/AppNavigator'; 
import { 
  StyleSheet, 
  View, 
  StatusBar,
} from 'react-native';

import { 
  Colors, 
} from 'react-native/Libraries/NewAppScreen';
 
 
 

const App: () => React$Node = () => {
 
  return (
    <View style={styles.containerMain}> 
     {/*<HomeScreen/>*/}
     <AppNavigator/>
       
    </View>
  );
}; 
const styles = StyleSheet.create({
  containerMain: {
    backgroundColor: 'red',
    width: '100%',
    height:'100%'
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
