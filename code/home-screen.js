import React, { useEffect, useState } from 'react'
import { View, Text, Alert } from 'react-native'
import * as Keychain from 'react-native-keychain'
import axios from 'axios'
import sha1 from 'js-sha1'
import { parseString } from 'react-native-xml2js'

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
            throwError('Arvan Error', JSON.stringify(error))
        }
    }

    const getBbbStatus = async () => {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'bbb' })
            if (credentials) {
                const query = credentials.username + 'api/getMeetings?checksum=' + sha1('getMeetings' + credentials.password)
                axios.get(query)
                    .then(res => {
                        parseString(res.request._response, (error, result) => {
                            console.log(error)
                            if (result.response.meetings[0]) {
                                setMeetings(result.response.meetings.length)
                                let count = 0
                                for (const meeting of result.response.meetings) {
                                    count += Number(meeting.meeting[0].participantCount)
                                }
                                setParticipants(count)
                            }
                        })
                    })
                    .catch(error => throwError('BigBlueButton Error', error.message))
            } else {
                throwError('BigBlueButton Error', 'No BigBlueButton credentials')
            }
        } catch (error) {
            throwError('BigBlueButton error', JSON.stringify(error))
        }
    }

    const throwError = (errorType, errorText) => {
        Alert.alert(errorType, errorText, [{ text: 'OK' }])
    }

    useEffect(() => {
        getServerStatus()
        getBbbStatus()
    }, [])

    const [serverStatus, setServerStatus] = useState('')
    const [meetings, setMeetings] = useState(0)
    const [participants, setParticipants] = useState(0)

    return (
        <View style={styles.container}>
            <Text> {serverStatus} </Text>
            <Text> {meetings ? meetings + ' meeting(s) are running.' : 'There is not any meetings.'} </Text>
            <Text> {participants ? participants + ' participant(s) are online.' : 'There is no participant online.'} </Text>
        </View>
    )
}

export default HomeScreen
