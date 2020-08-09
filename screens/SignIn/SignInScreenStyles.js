import { StyleSheet, Dimensions } from 'react-native'

export default StyleSheet.create({
  introTitle: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 20,

    marginTop: 40,
  },
  introItem: {
    marginTop: 20,
    flexDirection: 'row',

    alignItems: 'center',
    width: Dimensions.get('window').width,
  },
  webView:{
    width: Dimensions.get('window').width,
     
  },
  introItemImage: {
    marginLeft: 15,
    height: 80,
    width: 80,
    resizeMode: 'contain',
  },
  boxImage: {
    marginTop: 30,
    height: 150,
    resizeMode: 'contain',
  },
  introItemText: {
    color: AppStyles.color.appBlack,
    textAlign: 'left',
    paddingLeft: 10,
    paddingRight: 25,
    width: Dimensions.get('window').width - 80,
    fontFamily: AppStyles.color.appFont,
    fontSize: 20,
  },
  infoText: {
    color: AppStyles.color.appBlack,
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 18,
    width: Dimensions.get('window').width - 35,
    marginBottom:60
  },
  infoTextTop: {
    marginTop:30,
    color: AppStyles.color.appBlack,
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 18,  
    width: Dimensions.get('window').width - 35,
  },
  subTitle: {
    color: AppStyles.color.appBlack,
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 25,
  },
  byNayuta: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    color: AppStyles.color.appBlack,
    fontSize: 10,
  },
  title: {
    marginTop: 30,
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    color: AppStyles.color.appBlack,
    fontSize: 60,
    textDecorationLine: 'underline',
  },
  container: {
    backgroundColor: '#fff',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    height: Dimensions.get('window').height
  },
  intro1Container: {
    position: "absolute",
    alignItems: 'center',
    backgroundColor: 'white',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  centerContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  centerContainerLess: {
    paddingTop: 50,
    alignItems: 'center',
  },
  welcomeImage: {
    height: 80,
    resizeMode: 'contain',
  },
  roundedButton: {
    height: 60,
    width: '100%',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    backgroundColor: AppStyles.color.appBlack,
  },

  roundedButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
  },


  simpleButton: {
    height: 60,
    width: '100%',
    justifyContent: 'center',
  },
  toggleText:{
    marginTop:4,
    color: AppStyles.color.appBlack,
    fontFamily: AppStyles.color.appFont,
    fontSize: 18,
  },
  simpleButtonText: {
    color: AppStyles.color.appBlack,
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 25,
  },
  simpleButtonTextSmall: {
    color: AppStyles.color.appBlack,
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 20,
  },
  simpleButtonTextSmallWhite: {
    color: "white",
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 20,
  },


  bottomButton: {
    top: 20,
    borderColor: AppStyles.color.appBlack,
    backgroundColor: 'white'
  },


  bottomText: {
    color: '#393d3f',
  },

  buttonsContainer: {
    alignItems: 'center',
    bottom: 50,
    position: 'absolute',
    width: '90%',
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
