import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ScrollView, RefreshControl, Text, Alert, Button, View, Image } from 'react-native'
import * as Keychain from 'react-native-keychain'
import axios from 'axios'
import sha1 from 'js-sha1'
import { parseString } from 'react-native-xml2js'

import styles from './styles'

const HomeScreen = () => {
    const getServerStatus = async () => {
        console.log('GAVMISH')
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'arvan' })
            if (credentials) {
                log(2, 'Getting server status')
                await axios.get('https://napi.arvancloud.com/iaas/v1/server', {
                    headers: {
                        Authorization: 'Apikey ' + credentials.password
                    }
                })
                    .then(res => {
                        let found = false
                        for (const server of res.data.data) {
                            if (server.id === credentials.username) {
                                found = true
                                setServerStatus(server.status)
                            }
                        }
                        if (found) log(0, 'Recieved server status.')
                        else log(1, 'Cannot find server. Check server ID.')
                    })
                    .catch(error => {
                        log(1, error.response.status + ' ' + error.response.data.message)
                        log(1, 'Arvan Error:')
                    })
            } else {
                log(1, 'No Arvan Credentials')
                log(1, 'Arvan Error: ')
            }
        } catch (error) {
            log(1, JSON.stringify(error))
            log(1, 'Arvan Error: ')
        }
    }

    const getBbbStatus = async () => {
        console.log('SHOTOR')
        console.log(serverStatus)
        if (serverStatus !== 'SHUTOFF') {
            try {
                const credentials = await Keychain.getGenericPassword({ service: 'bbb' })
                if (credentials) {
                    log(2, 'Getting BigBlueButton Status')
                    const query = credentials.username + 'api/getMeetings?checksum=' + sha1('getMeetings' + credentials.password)
                    await axios.get(query)
                        .then(res => {
                            parseString(res.request._response, (error, result) => {
                                log(0, 'Recieved BigBlueButton Status')
                                console.log(error)
                                if (result.response.meetings[0]) {
                                    setMeetings(result.response.meetings.length)
                                    let count = 0
                                    for (const meeting of result.response.meetings) {
                                        count += Number(meeting.meeting[0].participantCount)
                                    }
                                    setParticipants(count)
                                } else {
                                    setParticipants(0)
                                }
                            })
                        })
                        .catch(error => {
                            log(1, error.message)
                            log(1, 'Arvan Error:')
                        })
                } else {
                    log(1, 'No BigBlueButton credentials')
                    log(1, 'BigBlueButton Error')
                }
            } catch (error) {
                log(1, JSON.stringify(error))
                log(1, 'BigBlueButton Error')
            }
        }
    }

    const turnOn = async () => {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'arvan' })
            if (credentials) {
                log(2, 'Sending request to ArvanCloud')
                await axios.patch(`https://napi.arvancloud.com/iaas/v1/server/${credentials.username}/action`, { type: 'power-on' }, {
                    headers: {
                        Authorization: 'Apikey ' + credentials.password
                    }
                })
                    .then(() => log(0, 'Request Accepted'))
                    .catch(error => {
                        log(1, error.message)
                        log(1, 'Arvan Error:')
                    })
            } else {
                log(1, 'No Arvan Credentials')
                log(1, 'Arvan Error: ')
            }
        } catch (error) {
            log(1, JSON.stringify(error))
            log(1, 'Arvan Error: ')
        }
    }

    const turnOff = async () => {
        try {
            const credentials = await Keychain.getGenericPassword({ service: 'arvan' })
            if (credentials) {
                if (participants === 0) {
                    log(2, 'Sending request to ArvanCloud')
                    await axios.patch(`https://napi.arvancloud.com/iaas/v1/server/${credentials.username}/action`, { type: 'power-off' }, {
                        headers: {
                            Authorization: 'Apikey ' + credentials.password
                        }
                    })
                        .then(() => log(0, 'Request Accepted'))
                        .catch(error => {
                            log(1, error.message)
                            log(1, 'Arvan Error:')
                        })
                } else if (!participants) {
                    throwError('BigBlueButton Error', 'Cannot recieve information from BigBlueButton.')
                    log(1, 'No BigBlueButton information')
                    log(1, 'BigBlueButton Error')
                } else {
                    throwError('Cannot Turn Off', `There are ${participants} participant(s) present in the server.`)
                }
            } else {
                log(1, 'No Arvan Credentials')
                log(1, 'Arvan Error: ')
            }
        } catch (error) {
            log(1, JSON.stringify(error))
            log(1, 'Arvan Error: ')
        }
    }

    const throwError = (errorType, errorText) => {
        Alert.alert(errorType, errorText, [{ text: 'OK' }])
    }

    const log = (logType, logMessage) => {
        switch (logType) {
        case (0) :
            setLastLog('🟢' + logMessage)
            break
        case (1) :
            setLastLog('🔴' + logMessage)
            break
        case (2) :
            setLastLog('🟡' + logMessage)
            break
        default:
            setLastLog('🟡' + logMessage)
        }
    }

    const toggleLogView = () => {
        setDisplayLogs(!displayLogs)
    }

    const refresh = async () => {
        setRefreshing(true)
        await getServerStatus()
        await getBbbStatus()
        setRefreshing(false)
    }

    const [serverStatus, setServerStatus] = useState('')
    const [meetings, setMeetings] = useState(0)
    const [participants, setParticipants] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [lastLog, setLastLog] = useState()
    const [logs, setLogs] = useState([])
    const [displayLogs, setDisplayLogs] = useState(false)

    useEffect(() => {
        refresh()
        setInterval(refresh, 30000)
    }, [])

    useEffect(() => {
        setLogs([lastLog, ...logs])
    }, [lastLog])

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh}/>}>
            <Image source={require('../assets/title-logo.png')} style={styles.logo}/>
            <View style={styles.container} >
                <Text style={styles.titleText}> Server Status </Text>
                <Text style={styles.normalText}> Server is {serverStatus === 'ACTIVE' ? 'On' : 'Off or Unavailable'} </Text>
                {(serverStatus === 'SHUTOFF') ? <Button disabled={refreshing} title='Turn On' onPress={turnOn} color='#56d0d0'/> : <Button disabled={refreshing} title='Turn Off' onPress={turnOff} color='#56d0d0'/>}
            </View>
            <View style={styles.container} >
                <Text style={styles.titleText}> BigBlueButton Status </Text>
                <Text style={styles.normalText}> {meetings ? meetings + ' meeting(s) are running.' : 'There is not any meetings.'} </Text>
                <Text style={styles.normalText}> {participants ? participants + ' participant(s) are online.' : 'There is no participant online.'} </Text>
            </View>
            <View style={styles.container} >
                <Text onPress={toggleLogView} style={styles.titleText}> Request Status {displayLogs ? '▲' : '▼'} </Text>
                {displayLogs ? <LogView logs={logs} /> : <Text style={styles.normalText}>{lastLog}</Text>}
            </View>
        </ScrollView>
    )
}

export default HomeScreen

const LogView = ({ logs }) => {
    return (
        <View style={styles.logContainer}>
            {logs.map((value, index) => <Text key={index}> {value} </Text>)}
        </View>
    )
}

LogView.propTypes = {
    logs: PropTypes.array
}
