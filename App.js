import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import AuthStackNavigator from './src/stack/AuthStack';
import LoggedInTabNavigator from './src/stack/LoggedInTab';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import LoadingScreen from './src/screens/LoadingScreen';
import { enableScreens } from 'react-native-screens';
import { Background } from './src/components/common';
enableScreens();
/*
	StackNav
    - Welcome
    - Auth
    - Loggedin stack nav default home
        bottom tab
        - Home
        - Questions stack nav
            - Question
        - Feedback
        - Profile

    - Home
        - Questions List
            - Question Detailed
            - Search Page to categorise subjects by subjects and art forms
        - Feedback
*/

const Stack = createStackNavigator();

function getHeaderTitle(route) {
	const routeName = route.state ? route.state.routes[route.state.index].name : 'Auth';

	switch (routeName) {
		case 'Home':
			return 'Home';
		case 'Feedback':
			return 'Feedback';
		case 'Profile':
			return 'Profile';
		case 'Arts':
			return 'Arts';
		case 'Quiz':
			return 'Quiz';
		default:
			return routeName;
	}
}

class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<NavigationContainer>
        			<Stack.Navigator
						screenOptions={{
							gestureEnabled: true,
							gestureDirection: 'horizontal',
							...TransitionPresets.SlideFromRightIOS
						}}
						initialRouteName='Loading'
						headerMode='float'
						animation='fade'
					>
						<Stack.Screen
							options={() => ({
								headerShown: false,
								gestureEnabled: false,
							})}
							name='Loading'
							component={LoadingScreen}
						/>
						<Stack.Screen
							options={({ route }) => ({
								title: getHeaderTitle(route),
								headerShown: false,
								headerLeft: null,
								gestureEnabled: false,
							})}
							name='LoggedInTab'
							component={LoggedInTabNavigator}
						/>
						<Stack.Screen
							options={({ route }) => ({
								title: getHeaderTitle(route),
								headerShown: false,
								headerLeft: null,
								gestureEnabled: false,
							})}
							name='Auth'
							component={AuthStackNavigator}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</Provider>
		);
	}
}

export default App;