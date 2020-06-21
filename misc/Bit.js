import React from "react";
import { View, Text } from "react-native"; 
import styles from './BitStyles';
import FadeInOut from 'react-native-fade-in-out';
export default class Bit extends React.Component { 

   state = {
        show:false,
        char:"", 
    }

    async componentDidMount() {
      
   

    this.SetChars();
   
    
    }

    SetChars(){

        if(this.props == undefined){
            return; 
        } 
        if(this.props.hash === ""){

        
        var chars = "0123456789ABCDEF";
        this.setState({char:chars[Math.floor(Math.random()*chars.length)],show:true})

var that = this;
        setTimeout(function(){
            that.setState({show:false})
that.SetChars();
        },100+(Math.random()*500))

    }else{
        if(this.props.num != undefined){
 
            this.setState({char:"",show:false})
            setTimeout(()=>{
                this.setState({char:this.props.hash[this.props.num],show:true})
            },2000 + (this.props.num*20))
       
        }

    }

    }
  render() { 

   
    

    return (
       
    <FadeInOut visible={this.state.show} duration={1000} style={styles.outerView}><Text style={styles.textView}>{this.state.char}</Text></FadeInOut> 
  
       
    );
  }
}