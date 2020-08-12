import React, { useEffect, useState } from 'react'
import { ScrollView, RefreshControl, Text, Alert, Button } from 'react-native'
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
                await axios.get('https://napi.arvancloud.com/iaas/v1/server', {
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
        if (serverStatus === 'ACTIVE') {
            try {
                const credentials = await Keychain.getGenericPassword({ service: 'bbb' })
                if (credentials) {
                    const query = credentials.username + 'api/getMeetings?checksum=' + sha1('getMeetings' + credentials.password)
                    await axios.get(query)
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
    }

    const turnOn = async () => {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'arvan' })
            if (credentials) {
                await axios.patch(`https://napi.arvancloud.com/iaas/v1/server/${credentials.username}/action`, { type: 'power-on' }, {
                    headers: {
                        Authorization: 'Apikey ' + credentials.password
                    }
                })
                    .then(res => console.log(res))
                    .catch(error => throwError('Arvan Error', error.message))
            } else {
                throwError('Arvan Error', 'No Arvan Credentials')
            }
        } catch (error) {
            throwError('Arvan Error', JSON.stringify(error))
        }
    }

    const turnOff = async () => {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'arvan' })
            if (credentials) {
                if (participants === 0) {
                    await axios.patch(`https://napi.arvancloud.com/iaas/v1/server/${credentials.username}/action`, { type: 'power-off' }, {
                        headers: {
                            Authorization: 'Apikey ' + credentials.password
                        }
                    })
                        .then(res => console.log(res))
                        .catch(error => throwError('Arvan Error', error.message))
                } else if (!participants) {
                    throwError('BigBlueButton Error', 'Cannot recieve information from BigBlueButton.')
                } else {
                    throwError('Cannot Turn Off', `There are ${participants} participant(s) present in the server.`)
                }
            } else {
                throwError('Arvan Error', 'No Arvan Credentials')
            }
        } catch (error) {
            throwError('Arvan Error', JSON.stringify(error))
        }
    }

    const throwError = (errorType, errorText) => {
        Alert.alert(errorType, errorText, [{ text: 'OK' }])
    }

    const refresh = async () => {
        setRefreshing(true)
        await getServerStatus()
        await getBbbStatus()
        setRefreshing(false)
    }

    const silentRefresh = () => {
        getServerStatus()
        getBbbStatus()
    }

    useEffect(() => {
        refresh()
        setInterval(silentRefresh, 10000)
    }, [])

    const [serverStatus, setServerStatus] = useState('')
    const [meetings, setMeetings] = useState(0)
    const [participants, setParticipants] = useState(0)
    const [refreshing, setRefreshing] = useState(false)

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
            <Text> {serverStatus} </Text>
            {(serverStatus === 'SHUTOFF') ? <Button title='Turn On' onPress={turnOn} /> : <Button title='Turn Off' onPress={turnOff} />}
            <Text> {meetings ? meetings + ' meeting(s) are running.' : 'There is not any meetings.'} </Text>
            <Text> {participants ? participants + ' participant(s) are online.' : 'There is no participant online.'} </Text>
        </ScrollView>
    )
}

export default HomeScreen
