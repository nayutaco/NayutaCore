import { StyleSheet, Dimensions } from 'react-native' 

const { height,width } = Dimensions.get("window");
  
export default StyleSheet.create({
   row:{
        alignItems:"center",
        flexDirection: 'row', 
        justifyContent:"center" 
    },
  outerView: {
   width:width / 8,
   height:width / 8,
   backgroundColor:"transparent",
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center'
  },
  textView: {
   textAlign:"center",
   fontSize:30,
   color: 'rgba(0,0,0,0.5)',
   }
 
});