import { StyleSheet, Dimensions } from 'react-native'
import AppStyles from '../../AppStyles';

const { height, width } = Dimensions.get("window");

export default StyleSheet.create({
  blocksList: {
    marginTop: 20,
  },
  blockCell: {
    width: "100%",
    flex: 1,
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockCellInner: {
    width: width - 20,
    height: 190,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  blockCellInfo: {
    marginTop: 7,
    height: 130

  },
  blockInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  blockTitle: {
    marginTop: 10,
    marginLeft: 15,
    fontSize: 20,
    fontFamily: AppStyles.color.appFont,
  },
  blockSubTitleText: {
    marginLeft: 5,
    fontSize: 15,
    color: 'rgba(0,0,0,0.6)'
  },
  blockSubTitle: {
    marginLeft: 15,
    fontSize: 15
  },
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
  onionIcon: {
    opacity: 0.5,
    marginLeft: 10,
    marginTop: 10,
    width: 30,
    height: 30
  },
  lightningIcon: {
    opacity: 0.5,
    marginLeft: 10,
    marginTop: 10,
    width: 30,
    height: 30
  },
  bitcoindIcon: {
    opacity: 0.5,
    marginLeft: 10,
    marginTop: 10,
    width: 30,
    height: 30
  },
  topIcons: {
    flexDirection: 'row',
    width: '30%',
  },
  topBar: {

    width: '100%'
  },
  statusTopView: {
    marginTop: 10,
    paddingRight: 10,
    position: 'absolute',
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
  container: {
    width: '100%'
  },
  settingsIcon: {
    marginTop: 10,
    paddingRight: 10,
    position: 'absolute',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    width: 40,
    height: 40
  },
  content: {
    height: height * 20
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
  nodeStatusText: {
    textAlign: 'right',
    alignSelf: 'flex-end',
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
    paddingRight: 10,
    marginTop: 10,

  },
  topButtons: {
    flexDirection: 'row',
  },

  roundedButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
  },


  topView: {
    marginTop: 10,
    width: "100%",
    height: width * 0.4,
    flexDirection: 'row'
  },
  detailsView: {
    paddingLeft: 3, 
    width: "60%",
    height: "100%",
    justifyContent: 'center',
  },
  progressView: { 
    width: "42%", 
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center'
  },
  circularProgressView: {
  },

  roundedButton: {
    marginTop: 20,
    marginRight: 10,
    alignSelf: 'flex-start',
    height: 35,
    width: 90,
    borderRadius: 17.5,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    backgroundColor: AppStyles.color.appBlack,
  },

  simpleButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 15,
  },


  percentageText: {
    width: "100%",
    position: 'absolute',
    color: 'rgba(0,0,0,0.8)',
    textAlign: 'center',
    fontFamily: AppStyles.color.appFont,
    fontSize: 37,
  },
  statusText1: {
    paddingRight: 10,
    color: 'rgba(0,0,0,0.7)',
    textAlign: 'left',
    fontFamily: AppStyles.color.appFont,
    fontSize: 28,
  },
  statusText2: {
    marginTop: 20,
    paddingRight: 30,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'left',
    fontFamily: AppStyles.color.appFont,
    fontSize: 20,
  },

  buttonsContainer: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timelineView: {
    marginTop: 20,
    width: '100%',
    height: height - (width * 0.6),
    paddingBottom: 20,

  },
  innerView: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
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
  timelineProvider: {
    width: 100,
    height: 60,
    justifyContent: 'flex-end',
    position: 'absolute',
    left: 5,
    bottom: 5
  },

  timelineProviderImage: {
    width: 100,
    height: 35,
    resizeMode: "contain"
  },
  timelineProviderText: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 10,
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
  bitsAnimation: {
    marginTop: 20,
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