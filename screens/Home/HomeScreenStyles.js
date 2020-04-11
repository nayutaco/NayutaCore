import { StyleSheet, Dimensions } from 'react-native'
import AppStyles from '../../AppStyles';

const { height } = Dimensions.get("window");

const cardHeight = 250;
export default StyleSheet.create({
  outer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  half: {
    position: "absolute",
    left: 0,
    top: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  root: {
    flex: 1,
  },
  onionIcon:{
    opacity:0.5,
    marginLeft:10,
    marginTop:10,
    width:30,
    height:30
  },
  lightningIcon:{
    opacity:0.5,
    marginLeft:10,
    marginTop:10,
    width:30,
    height:30
  },
  bitcoindIcon:{
    opacity:0.5,
    marginLeft:10,
    marginTop:10,
    width:30,
    height:30
  },
  topIcons:{ 
flexDirection:'row',
width:'30%',
  },
  topBar:{  
    
width:'100%'
  },
  statusTopView: {
    marginTop:10,
    paddingRight:10,
    position:'absolute',
    alignSelf: 'flex-end', 
    flexDirection: 'row', 
  },
  chartOuter: {
    backgroundColor: AppStyles.color.appBlack,
    position: 'absolute',
    marginTop: height - 375,
    elevation: 20,
    borderRadius: 16
  },
  spinner: {
    color: AppStyles.color.appBlack
  },
  cardsView:{
    marginTop:40,
    marginLeft:10,
    marginRight:10
  },
  container: {
    height: '100%',
    width: '100%'
  },
  topStatus: {
    marginLeft: 10,
    textAlign:'right'
  },
  content: {
    height: height * 20
  },
  card: {
    height: cardHeight,
    borderRadius: 10,
    elevation: 15
  },
  seperator: {
    marginTop: 10,
    width: '90%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topLine: {
    marginLeft: 10,
    marginTop: 10,
    flexDirection: 'row',
  },
  bitcoinDenomination: {
    color: 'white',
    paddingLeft: 5,
    paddingTop: 20,
    textAlign: 'left',
    fontFamily: 'sans-serif-light',
    fontSize: 20,
  },
  fiatDenomination: {
    color: 'white',
    paddingLeft: 5,
    paddingTop: 20,
    textAlign: 'left',
    fontFamily: 'sans-serif-light',
    fontSize: 20,
  },
  cardAmountFiat: {
    color: 'white',
    paddingLeft: 5,
    textAlign: 'left',
    fontFamily: 'sans-serif-light',
    fontSize: 40,
  },
  cardAmount: {
    color: 'white',
    paddingLeft: 5,
    textAlign: 'left',
    fontFamily: 'sans-serif-light',
    fontSize: 40,
  },
  cardTitle: {

    color: 'white',
    paddingLeft: 15,
    paddingTop: 12,
    textAlign: 'left',
    fontFamily: 'sans-serif-light',
    fontSize: 20,
  },
  chartTitle: {

    color: 'white',
    paddingLeft: 15,
    paddingTop: 12,
    textAlign: 'left',
    fontFamily: 'sans-serif-light',
    fontSize: 20,
  },
  nodeStatusText: {
    textAlign: 'right',
    alignSelf: 'flex-end',
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
    paddingRight: 10,
    marginTop: 10,

  },
  roundedButton: {
    height: 40,
    width: '30%',
    marginRight: 10,
    marginLeft: 10,
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

  statusText: {
    marginTop: 30,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
  },

  topView: {
    flex: 1,
    top: 100,
    width: Dimensions.get('window').width - 10,
    textAlign: 'center',
    alignItems: 'center',
  },


  buttonsContainer: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  innerView: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    alignItems: 'center',
  },



  progressView: {
    position: "absolute",
    marginTop: Dimensions.get('window').height * 0.2,
    textAlign: "center",
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextLarge: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 80,
    textAlign: "center",

  },
  progressTextSmall: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 20,
    textAlign: "center",
    color: 'rgba(0,0,0,0.4)',
    paddingLeft: "20%",
    paddingRight: "20%",

  },
  progressText: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
    color: 'rgba(0,0,0,0.4)',
    textAlign: "center",

  },
  statusText: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 25,
    color: 'rgba(0,0,0,0.4)',
    textAlign: "center",

  },
  balanceTextTop: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 50,
    textAlign: "center",

  },

  balanceTextBottom: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 30,
    textAlign: "center",

  },
  progressTextView: {

    position: "absolute",
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
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
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
  }
});