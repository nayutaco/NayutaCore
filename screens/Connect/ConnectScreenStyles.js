import { StyleSheet, Dimensions } from 'react-native'
import AppStyles from '../../AppStyles';
export default StyleSheet.create({
  helpButton: {
    position: "absolute",
    right: 10,
    top: 10,
    fontSize: 20,
    color: 'rgba(0,0,0,0.7)',
  },
  qrCode: {
    position: "absolute",
    textAlign: "center",
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainView: {
    position: "absolute",
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  explainInnerView: {
    backgroundColor: 'white',
    marginLeft: 30,
    marginRight: 30,
    height: 300,
    borderRadius: 10,
    borderColor: 'rgba(223,227,231,1)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  explainItemTitle: {
    position: 'absolute',
    top: 20,
    fontSize: 18,
  },
  explainItemText: {
    textAlign: 'center',
    marginLeft: 30,
    marginRight: 30,
  },
  explainItemButtonText: {
    fontSize: 20,
    width: "100%"
  },
  explainItemButton: {
    position: 'absolute',
    bottom: 20,
  },
  explainItemSeperator: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    height: 1,
    position: 'absolute',
    top: 60,
    width: '80%'
  },
  qrCodeView: {
    marginTop: Dimensions.get('window').height * 0.2,
    width: 500,
    backgroundColor: 'rgba(255,0,0,0.0)',
    position: "absolute",
    textAlign: "center",
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 50,
    height: 50
  },
  walletIcon: {
    marginLeft: 10,
    width: 50,
    height: 50
  },
  instructionsIcon: {
    marginLeft: 10,
    marginTop: 20,
    width: 40,
    height: 40
  },
  connectButton: {

    fontSize: 25,
    textAlign: "center"
  },
  qrCodeInstructions: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  qrCodeInstructionsTop: {
    marginTop: 30,
    marginLeft: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  connectButtonText: {
    fontSize: 25,
    textAlign: "center"
  },
  modeText: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,

  },
  switch: {
    marginLeft: 40,
    marginRight: 40,
    transform: [{ scaleX: 2.3 }, { scaleY: 2.3 }]
  },
  buttonsContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  roundedButtonSmall: {
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
  roundedButtonWhite: {
    borderColor: AppStyles.color.appBlack,
    textAlign: 'center',
    marginTop: 20,
    height: 40,
    width: '60%',
    borderRadius: 20,
    borderWidth: 1,

    justifyContent: 'center',
  },
  roundedButton: {
    textAlign: "center",
    marginTop: 20,
    height: 40,
    width: '50%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
  },

  modeContainer: {
    position: 'absolute',
    bottom: 150,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    width: Dimensions.get('window').width,
    height: "100%",
    backgroundColor: '#fff',
  },

  innerView: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    alignItems: 'center',
  },

  titleText: {
    marginTop: 50,
    fontFamily: AppStyles.color.appFont,
    fontSize: 20,
    marginLeft: 20,
    marginRight: 20,
    textAlign: "center",


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
    fontSize: 50,
    textAlign: "center",

  },
  progressText: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
    color: 'rgba(0,0,0,0.4)',
    textAlign: "center",


  },
  subtitle: {
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
    color: 'rgba(0,0,0,0.4)',
    textAlign: "center",

  },
  instructionsSubtitle: {
    marginLeft: 10,
    marginTop: 20,
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
    color: 'rgba(0,0,0,0.4)',
    textAlign: "center",

  },
  connectionWarning: {
    marginTop: 200,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: AppStyles.color.appFont,
    fontSize: 17,
    color: 'rgba(0,0,0,0.4)',
    textAlign: "center",
  },
  progressTextView: {
    zIndex: 1,
    width: '100%',
    position: "absolute",
    alignItems: 'center',
    justifyContent: 'center',
  }
});