import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import SettingsScreen from './code/settings-screen'
import HomeScreen from './code/home-screen'

const Tab = createBottomTabNavigator()

const App = () => {
    return (
        <>
            <NavigationContainer>
                <Tab.Navigator tabBarOptions={{ labelPosition: 'beside-icon' }}>
                    <Tab.Screen name='Home' component={HomeScreen} />
                    <Tab.Screen name='Settings' component={SettingsScreen} />
                </Tab.Navigator>
            </NavigationContainer>
        </>
    )
}

export default App
