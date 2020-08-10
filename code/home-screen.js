import React, { useEffect, useState } from 'react'
import { View, Text, Alert } from 'react-native'
import * as Keychain from 'react-native-keychain'
import axios from 'axios'

import styles from './styles'

const HomeScreen = () => {
    const getServerStatus = async () => {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'arvan' })
            if (credentials) {
                axios.get('https://napi.arvancloud.com/iaas/v1/server', {
                    headers: {
                        Authorization: 'Apikey ' + credentials.password
                    }
                })
                    .then(res => {
                        for (const server of res.data.data) {
                            if (server.id === credentials.username) {
                                setServerStatus(server.status)
                            }
                        }
                    })
                    .catch(error => throwError('Arvan Error', error.response.status + ' ' + error.response.data.message))
            } else {
                throwError('Arvan Error', 'No Arvan Credentials')
            }
        } catch (error) {
            throwError('Arvan Error', error)
        }
    }

    const throwError = (errorType, errorText) => {
        Alert.alert(errorType, errorText, [{ text: 'OK' }])
    }

    useEffect(() => {
        getServerStatus()
    }, [])

    const [serverStatus, setServerStatus] = useState('')

    return (
        <View style={styles.container}>
            <Text> {serverStatus} </Text>
        </View>
    )
}

export default HomeScreen
