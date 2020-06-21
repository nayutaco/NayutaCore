import { StyleSheet, Dimensions } from 'react-native'  

const { height,width } = Dimensions.get("window");
  
export default StyleSheet.create({
   row:{
        alignItems:"center",
        flexDirection: 'row', 
        justifyContent:"center" 
    },
  outerView: {
   width:width*0.3333,
   height:width*0.3333,
   backgroundColor:"transparent",
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center'
  },
  outerView:{
     marginTop:20
  },
  title: {
     marginLeft:15,
     marginTop:15,
   textAlign:"left",
   fontSize:20,
   opacity:0.5,
   },
  textView: {
   textAlign:"center",
   fontSize:30
   },
   blocksView:{ 
   },
   blocksImage:{  
    left:-800,
    marginTop:20,
       width:2000,
       height:150, 
    resizeMode:"contain",
    opacity:0.4
    
   }
 
});