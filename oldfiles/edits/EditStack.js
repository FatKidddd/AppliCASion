import React, { Component } from 'react';
import EditSelectionScreen from './EditSelection';
import { createStackNavigator } from '@react-navigation/stack';
//import { BackButton } from '../../components/common/BackButton';
import EditQuestionScreen from './EditQuestion';

const Edit = createStackNavigator();

const EditStack = ({ navigation }) => {
    return (
        <Edit.Navigator
            screenOptions={() => ({
                headerStyle: { backgroundColor: '#001e3c' },//'#246887' },
                headerTitleStyle: { color: 'white' },
                // headerLeft: () => (
                //     <BackButton
                //         onPress={() => {
                //             navigation.goBack();
                //         }}
                //         size={30}
                //     />
                // )
            })}
        >
            <Edit.Screen name='EditSelection' component={EditSelectionScreen} />
            <Edit.Screen name='EditQuestion' component={EditQuestionScreen} />
        </Edit.Navigator>
    )
};

export default EditStack;