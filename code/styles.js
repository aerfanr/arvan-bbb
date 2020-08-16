import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    input: {
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 3,
        marginBottom: 7.5,
        marginTop: 7.5
    },
    container: {
        padding: 15,
        margin: -7.5
    },
    normalText: {
        fontSize: 18
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8
    },
    logContainer: {
        backgroundColor: '#ececec',
        borderRadius: 3,
        padding: 3
    },
    logo: {
        height: 75,
        resizeMode: 'contain',
        alignSelf: 'center'
    },
    error: {
        color: '#ed254e'
    },
    success: {
        color: '#00c2be'
    },
    info: {
        color: '#f9dc5c'
    }
})

export default styles
