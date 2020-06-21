import { StyleSheet, Dimensions } from 'react-native'

export default StyleSheet.create({
    backgroundView: {
        backgroundColor: 'rgba(231,234,239,1)',
        height: '100%',
    },
    menuItemInner: {
    },
    menuItem: {
        backgroundColor: 'white',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        height: 80,
        borderRadius: 10,
        borderColor: 'rgba(223,227,231,1)',
        borderWidth: 1,
        justifyContent: 'center',
    },
    versionText: {
        marginTop: 20,
        textAlign: 'center',
        color: 'rgba(0,0,0,0.5)',
    },
    menuText: {
        paddingLeft: 10,
        height: 60,
        width: '70%',
        height: 17,
        lineHeight: 17,
        fontSize: 17
    },
    iconView: {
        alignSelf: 'flex-end',
        position: 'absolute'

    },
});
