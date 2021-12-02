import React, { Component } from 'react';
import { Text, View, StyleSheet, StatusBar, Image, TextInput, TouchableOpacity } from 'react-native';
import { Loading } from '../../components/common';
//import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
//import RNPickerSelect from 'react-native-picker-select';
//import { resetQuestions } from '../redux/actions';
import db from '../../../Fire';
import firebase from 'firebase';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import ModalSelector from 'react-native-modal-selector';

class SubmitQuestionScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subjects: [],
            questionTitle: '',
            questionText: '',
            loading: false,
            errorMessage: '',
            image: null,
            modalVisible: false
        }
        this.submitQuestion = this.submitQuestion.bind(this);
        this.pickImage = this.pickImage.bind(this);
    }

    componentDidMount() {
        this.getPhotoPermission();
    }

    async getPhotoPermission() {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            
            if (status != 'granted') {
                alert('Permission is required to access your camera roll');
            }
        }
    }

    async pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
        });

        if (!result.cancelled) {
            this.setState({ image: result.uri });
        }
    }

    async uploadPhotoAsync(uri, uid) {
        const path = `photos/${uid}/${Date.now()}.jpg`;

        return new Promise(async (res, rej) => {
            const response = await fetch(uri);
            const file = await response.blob();

            let upload = firebase.storage().ref(path).put(file);

            upload.on(
                'state_changed',
                snapshot => {},
                err => {
                    rej(err);
                },
                async () => {
                    const uri = await upload.snapshot.ref.getDownloadURL();
                    res(uri);
                }
            );
        });
    };

    async submitQuestion() {
        const { subjects, questionTitle, questionText, image } = this.state;
        if (subjects.length > 0 && questionTitle.length > 0) {
            this.setState({ loading: true });

            const uid = firebase.auth().currentUser.uid;

            const remoteUri = image ? await this.uploadPhotoAsync(image, uid) : '';

            db.collection('questions').doc().set({
                subjects: subjects,
                questionText: questionText,
                dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
                displayName: firebase.auth().currentUser.displayName,
                uid: uid,
                userImage: firebase.auth().currentUser.photoURL,
                image: remoteUri
                //userRef: db.doc('users/' + firebase.auth().currentUser.uid),
            })
            .then(() => {
                // questionRef.collection('likers').doc('--stats--').set({
                //     likesCount: 0
                // });
                console.log('Question Submitted.')
                this.setState({ loading: false, questionText: '', subjects: [], image: null });
                this.props.navigation.navigate('QuestionsList', { refresh: true });
            })
            .catch(error => console.log(error.message));
        }
    }

    handleSubjects(subject) {
        this.setState({ subjects: [...this.state.subjects, subject] })
    }

    render() {
        const { submitButton, submitText, submitLabel, textInput } = styles;
        let index = 0;
        const data = [
            { key: index++, section: true, label: 'Subjects' },
            { key: index++, section: true, label: 'Group 1' },
            { key: index++, label: 'Literature', value: 'Literature' },
            { key: index++, section: true, label: 'Group 2' },
            { key: index++, label: 'Chinese', value: 'Chinese' },
            { key: index++, section: true, label: 'Group 3' },
            { key: index++, label: 'Geography', value: 'Geography' },
            { key: index++, label: 'History', value: 'History' },
            { key: index++, label: 'Economics', value: 'Economics' },
            { key: index++, label: 'Anthropology', value: 'Anthropology' },
            { key: index++, section: true, label: 'Group 4' },
            { key: index++, label: 'Chemistry', value: 'Chemistry' },
            { key: index++, label: 'Physics', value: 'Physics' },
            { key: index++, label: 'Biology', value: 'Biology' },
            { key: index++, section: true, label: 'Group 5' },
            { key: index++, label: 'Mathematics', value: 'Mathematics' },            
            { key: index++, section: true, label: 'Core' },
            { key: index++, label: 'ELCT', value: 'ELCT' },
            { key: index++, label: 'TOK', value: 'TOK' },
        ];

        return ( 
            <View>
                {/* <RNPickerSelect
                    onValueChange={(value) => this.setState({ subject: value })}
                    placeholder={{
                        label: 'Select a subject',
                        value: null,
                    }}
                    items={choices}
                /> */}
                {/* <TouchableOpacity onPress={() => this.setState({ modalVisible: !this.state.modalVisible })}> */}
                <ModalSelector
                    data={data}
                    initValue="Options"
                    supportedOrientations={['portrait', 'landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={(option) => this.handleSubjects(option.value)}
                    visible={this.state.modalVisible}
                    //onModalClose={() => this.setState({ modalVisible: !this.state.modalVisible })}
                >
                    <Text>{this.state.subject ? this.state.subject : 'Select a subject'}</Text>
                </ModalSelector>
                <ModalSelector
                    data={data}
                    initValue="Options"
                    supportedOrientations={['portrait', 'landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={(option) => this.handleSubjects(option.value)}
                    visible={this.state.modalVisible}
                    //onModalClose={() => this.setState({ modalVisible: !this.state.modalVisible })}
                >
                    <Text>{this.state.subject ? this.state.subject : 'Select a subject'}</Text>
                </ModalSelector>
                <ModalSelector
                    data={data}
                    initValue="Options"
                    supportedOrientations={['portrait', 'landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={(option) => this.handleSubjects(option.value)}
                    visible={this.state.modalVisible}
                    //onModalClose={() => this.setState({ modalVisible: !this.state.modalVisible })}
                >
                    <Text>{this.state.subject ? this.state.subject : 'Select a subject'}</Text>
                </ModalSelector>
                {/* </TouchableOpacity> */}
                <Text style={submitLabel}>Question</Text>
                <TextInput
                    placeholder='Enter question here'
                    value={this.state.questionText}
                    onChangeText={questionText => this.setState({ questionText: questionText })}
                    autoCorrect={false}
                    style={textInput}
                    multiline={true}
                />
                <TouchableOpacity onPress={this.pickImage}>
                    <Ionicons name='md-camera' size={32} color='#DBDBDB' />
                </TouchableOpacity>
                <View style={{ marginHorizontal: 32, maginTop: 32, height: 150 }}>
                    {this.state.image 
                        ? <Image source={{ uri: this.state.image }} style={{ width: '100%', height: '100%'}} />
                        : <Text>Nadine is sexy</Text>
                    }
                </View>
                <Text>{this.state.errorMessage}</Text>
                    {!this.state.loading ?
                        <TouchableOpacity style={submitButton} onPress={this.submitQuestion}>
                            <Text style={submitText}>Submit Question</Text>
                        </TouchableOpacity>
                        :
                        <Loading size={'small'} />
                    }
            </View> 
        );
    }
}

const styles = StyleSheet.create({
    submitLabel: {
        fontSize: 20,
        flexDirection: 'row',
        marginVertical: 30,
        fontWeight: '400',
    },

    textInput: {
        flexDirection: 'row',
        color: '#000',
        width: '100%',
        paddingTop: 3,
        paddingBottom: 20,
        fontSize: 20,
        lineHeight: 23,
        borderBottomWidth: 1,
        borderColor: '#bbb',
    },


    submitButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: 'rgb(12, 100, 205)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
    },

    submitText: {
        fontSize: 20,
        color: '#fff',
    },

    response: {
        alignItems: 'center',
        justifyContent: 'center'
    },
});

// const mapStateToProps = state => {
//     return {
//         questions: state.QUESTIONS.questions
//     };
// };

// export default connect(
//     mapStateToProps,
//     { resetQuestions }
// )(SubmitQuestionScreen);

export default SubmitQuestionScreen;

{/* <Modal
    animationType='slide'
    transparent={false}
    visible={this.props.modalVisible}
    supportedOrientations={['landscape', 'portrait']}
    onRequestClose={() => {
        console.log('Modal has been closed');
    }}
>    */}