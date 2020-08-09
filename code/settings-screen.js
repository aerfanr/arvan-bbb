import React, { useState, useEffect } from 'react'
import { View, Button, Text, TextInput } from 'react-native'
import * as Keychain from 'react-native-keychain'

import styles from './styles'

const SettingsScreen = () => {
    const [serverName, setServerName] = useState('')
    const [serverKey, setServerKey] = useState('')
    const [bbbName, setBbbName] = useState('')
    const [bbbKey, setBbbKey] = useState('')

    const fetchSettings = async () => {
        try {
            const arvanSettings = await Keychain.getGenericPassword({ service: 'arvan' })
            if (arvanSettings) {
                setServerName(arvanSettings.username)
            }
            const bbbSettings = await Keychain.getGenericPassword({ service: 'bbb' })
            if (arvanSettings) {
                setBbbName(bbbSettings.username)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const updateSettings = async () => {
        if (serverName && serverKey) {
            await Keychain.resetGenericPassword({ service: 'arvan' })
            await Keychain.setGenericPassword(serverName, serverKey, { service: 'arvan' })
        }
        if (bbbName && bbbKey) {
            await Keychain.resetGenericPassword({ service: 'bbb' })
            await Keychain.setGenericPassword(bbbName, bbbKey, { service: 'bbb' })
        }
    }

    return (
        <View style={styles.container}>
            <Text> Settings Screen </Text>
            <Text> Arvan Server Name: </Text>
            <TextInput value={serverName}
                onChangeText={text => setServerName(text)}
                style={styles.input}
            />
            <Text> Arvan API Key: </Text>
            <TextInput value={serverKey}
                onChangeText={text => setServerKey(text)}
                style={styles.input}
            />
            <Text> BigBlueButton Hostname: </Text>
            <TextInput value={bbbName}
                onChangeText={text => setBbbName(text)}
                style={styles.input}
            />
            <Text> BigBlueButton API Key: </Text>
            <TextInput value={bbbKey}
                onChangeText={text => setBbbKey(text)}
                style={styles.input}
            />
            <Button title="Submit" onPress={updateSettings}/>
        </View>
    )
}

export default SettingsScreen