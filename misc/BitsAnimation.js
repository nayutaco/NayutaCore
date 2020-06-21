import React from "react";
import { Animated, View, Image, Text } from "react-native";
import styles from './BitsAnimationStyles';
import 'proxy-polyfill';
import { Notifications } from 'react-native-notifications';
import FadeInOut from 'react-native-fade-in-out';
import Bit from './Bit';
const blocksImage = require('../assets/images/blocks.png');
export default class BitsAnimation extends React.Component {

    animatingBlocks = false;

    state = {
        show: true,
        showBits: true,
        showBlocks: false,
        statusText:"waiting for next block..."
    }

    constructor(props) {
        super(props);
        this.moveAnimation = new Animated.ValueXY({ x: 0, y: 0 })
    }

    async componentDidMount() {

        this.setState({ show: true })


        setInterval(() => {


            if (this.props.hash !== "" && this.animatingBlocks == false) {


                this.setState({statusText:"block found!"});


                this.animatingBlocks = true;
                setTimeout(() => {

                    this.setState({ showBits: false, showBlocks: true })


                    setTimeout(() => {
                        this._moveBlocks()

                    }, 1000)
                }, 7000)
            }

        }, 1000);
    }

    checkHash() {

    }

    _moveBlocks = () => {



        Animated.timing(this.moveAnimation, {
            toValue: { x: -220, y: 0 },
            duration: 3000,
        }).start(() => {



            setTimeout(() => {
                console.log("fin");
                this.setState({ show: false })
                this.animatingBlocks = false;

                setTimeout(() => {
                    this.setState({ showBits: true, showBlocks: false,statusText:"waiting for next block..." })
                }, 1000);
            }, 1000)

        })



    }

    render() {
 
        return (
            <View style={styles.outerView}>
                <Text style={styles.title}>{this.state.statusText}</Text>
                {this.state.showBlocks &&
                    <FadeInOut visible={this.state.show} duration={1000}>
                        <Animated.View style={[styles.blocksView, this.moveAnimation.getLayout()]}>
                            <Image source={blocksImage}
                                style={styles.blocksImage} />

                        </Animated.View>
                    </FadeInOut>
                }
                {this.state.showBits &&
                    <View>
                        <View style={styles.row}>
                            <Bit num={0} hash={this.props.hash} />
                            <Bit num={1} hash={this.props.hash} />
                            <Bit num={2} hash={this.props.hash} />
                            <Bit num={3} hash={this.props.hash} />
                            <Bit num={4} hash={this.props.hash} />
                            <Bit num={5} hash={this.props.hash} />
                            <Bit num={6} hash={this.props.hash} />
                            <Bit num={7} hash={this.props.hash} />

                        </View>
                        <View style={styles.row}>

                            <Bit num={8} hash={this.props.hash} />
                            <Bit num={9} hash={this.props.hash} />
                            <Bit num={10} hash={this.props.hash} />
                            <Bit num={11} hash={this.props.hash} />
                            <Bit num={12} hash={this.props.hash} />
                            <Bit num={13} hash={this.props.hash} />
                            <Bit num={14} hash={this.props.hash} />
                            <Bit num={15} hash={this.props.hash} />
                        </View>
                        <View style={styles.row}>

                            <Bit num={16} hash={this.props.hash} />
                            <Bit num={17} hash={this.props.hash} />
                            <Bit num={18} hash={this.props.hash} />
                            <Bit num={19} hash={this.props.hash} />
                            <Bit num={20} hash={this.props.hash} />
                            <Bit num={21} hash={this.props.hash} />
                            <Bit num={22} hash={this.props.hash} />
                            <Bit num={23} hash={this.props.hash} />
                        </View>
                        <View style={styles.row}>

                            <Bit num={24} hash={this.props.hash} />
                            <Bit num={25} hash={this.props.hash} />
                            <Bit num={26} hash={this.props.hash} />
                            <Bit num={27} hash={this.props.hash} />
                            <Bit num={28} hash={this.props.hash} />
                            <Bit num={29} hash={this.props.hash} />
                            <Bit num={30} hash={this.props.hash} />
                            <Bit num={31} hash={this.props.hash} />
                        </View>
                        <View style={styles.row}>

                            <Bit num={32} hash={this.props.hash} />
                            <Bit num={33} hash={this.props.hash} />
                            <Bit num={34} hash={this.props.hash} />
                            <Bit num={35} hash={this.props.hash} />
                            <Bit num={36} hash={this.props.hash} />
                            <Bit num={37} hash={this.props.hash} />
                            <Bit num={38} hash={this.props.hash} />
                            <Bit num={39} hash={this.props.hash} />

                        </View>
                        <View style={styles.row}>

                            <Bit num={40} hash={this.props.hash} />
                            <Bit num={41} hash={this.props.hash} />
                            <Bit num={42} hash={this.props.hash} />
                            <Bit num={43} hash={this.props.hash} />
                            <Bit num={44} hash={this.props.hash} />
                            <Bit num={45} hash={this.props.hash} />
                            <Bit num={46} hash={this.props.hash} />
                            <Bit num={47} hash={this.props.hash} />
                        </View>
                        <View style={styles.row}>

                            <Bit num={48} hash={this.props.hash} />
                            <Bit num={49} hash={this.props.hash} />
                            <Bit num={50} hash={this.props.hash} />
                            <Bit num={51} hash={this.props.hash} />
                            <Bit num={52} hash={this.props.hash} />
                            <Bit num={53} hash={this.props.hash} />
                            <Bit num={54} hash={this.props.hash} />
                            <Bit num={55} hash={this.props.hash} />
                        </View>
                        <View style={styles.row}>

                            <Bit num={56} hash={this.props.hash} />
                            <Bit num={57} hash={this.props.hash} />
                            <Bit num={58} hash={this.props.hash} />
                            <Bit num={59} hash={this.props.hash} />
                            <Bit num={60} hash={this.props.hash} />
                            <Bit num={61} hash={this.props.hash} />
                            <Bit num={62} hash={this.props.hash} />
                            <Bit num={63} hash={this.props.hash} />
                        </View>
                    </View>
                }
            </View>



        );
    }
}