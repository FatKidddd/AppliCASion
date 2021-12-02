import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import QuestionsListScreen from './QuestionsList';
//import DetailedQuestion from './DetailedQuestion';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SubmitQuestionScreen from './SubmitQuestion';
import SubmitAnswerScreen from './SubmitAnswer';
import AnswersListScreen from './AnswersList';
import { View } from 'react-native';
import { BackButton } from '../../components/common/BackButton';

// const Question = createStackNavigator();
// changed to bottom tab navigator because it's faster.
const Question = createBottomTabNavigator();

function getHeaderTitle(route) {
    const routeName = route.name || 'Auth';

    switch (routeName) {
        case 'QuestionsList':
            return 'Questions';
        case 'AnswersList':
            //return 'Detailed Question';
            return 'Answers';
        case 'SubmitQuestion':
            return 'Post Question';
        case 'SubmitAnswer':
            return 'Post Reply';
    }
}

const QuestionsList = createStackNavigator();
const QuestionsListStack = ({ navigation, route }) => {
    return (
        <QuestionsList.Navigator>
            <QuestionsList.Screen 
                options={({ route }) => ({
                    title: getHeaderTitle(route),
                    headerShown: true,
                    headerLeft: () => (
                        <BackButton
                            onPress={() => {
                                navigation.navigate('Home');
                            }}
                            size={30}
                        />
                    ),
                    headerRight: () => (
                        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                            {/* <TouchableOpacity onPress={this.handleSearchOpen}>
                                        <Ionicons size={30} name='md-search' style={{ paddingHorizontal: 10 }} />
                                    </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => navigation.navigate('SubmitQuestion')} style={{ paddingLeft: 20, paddingVertical: 5 }}>
                                <MaterialCommunityIcons size={30} name='plus' style={{ paddingHorizontal: 10, color: 'white' }} />
                            </TouchableOpacity>
                        </View>
                    ),
                    headerStyle: { backgroundColor: '#346887' },
                    headerTitleStyle: { color: 'white' },
                })}
                name='QuestionsList'
                component={QuestionsListScreen} 
            />
            <QuestionsList.Screen 
                name='AnswersList'
                component={AnswersListStack}
            />
        </QuestionsList.Navigator>
    );
};

const AnswersList = createStackNavigator();
const AnswersListStack = ({ navigation, route }) => {
    return (
        <AnswersList.Navigator>
            <AnswersList.Screen 
                options={({ route }) => ({
                    title: getHeaderTitle(route),
                    headerLeft: () => (
                        <BackButton
                            onPress={() => {
                                navigation.navigate('QuestionsList');
                            }}
                            size={30}
                        />
                    ),
                    headerStyle: { backgroundColor: '#346887' },
                    headerTitleStyle: { color: 'white' },
                })}
                name='AnswersList'
                component={AnswersListScreen} 
            />
        </AnswersList.Navigator>
    );
};

const SubmitQuestion = createStackNavigator();
const SubmitQuestionStack = ({ navigation, route }) => {
    return (
        <SubmitQuestion.Navigator>
            <SubmitQuestion.Screen
                options={({ route }) => ({
                    title: getHeaderTitle(route),
                    headerLeft: () => (
                        <BackButton
                            onPress={() => {
                                navigation.navigate('QuestionsList');
                            }}
                            size={30}
                        />
                    ),
                    headerStyle: { backgroundColor: '#346887' },
                    headerTitleStyle: { color: 'white' },
                })}
                name='SubmitQuestion'
                component={SubmitQuestionScreen} 
            />
        </SubmitQuestion.Navigator>
    );
};

const SubmitAnswer = createStackNavigator();
const SubmitAnswerStack = ({ navigation, route }) => {
    return (
        <SubmitAnswer.Navigator>
            <SubmitAnswer.Screen
                options={({ route }) => ({
                    title: getHeaderTitle(route),
                    headerLeft: () => (
                        <BackButton
                            onPress={() => {
                                navigation.navigate('AnswersList');
                            }}
                            size={30}
                        />
                    ),
                    headerStyle: { backgroundColor: '#346887' },
                    headerTitleStyle: { color: 'white' },
                })}
                name='SubmitAnswer'
                component={SubmitAnswerScreen}
            />
        </SubmitAnswer.Navigator>
    );
};

class QuestionsScreen extends Component {    
    render() {
        return (
            <Question.Navigator
                screenOptions={() => ({
                    tabBarVisible: false
                })}
            >
                <Question.Screen
                    name='QuestionsList' 
                    component={QuestionsListStack} 
                />
                {/* <Question.Screen 
                    name='AnswersList' 
                    component={AnswersListStack}
                /> */}
                <Question.Screen 
                    name='SubmitQuestion' 
                    component={SubmitQuestionStack} 
                />
                <Question.Screen 
                    name='SubmitAnswer' 
                    component={SubmitAnswerStack} 
                />
            </Question.Navigator>
        );
    }
}

export default QuestionsScreen;

