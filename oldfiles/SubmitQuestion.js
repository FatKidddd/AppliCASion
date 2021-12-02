import React, { Component, Fragment } from 'react';
import { Text, View, StyleSheet, StatusBar, Image, TextInput, TouchableOpacity, SafeAreaView, ScrollView, InteractionManager, Alert } from 'react-native';
import { Loading, Background } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import db from '../../../Fire';
import firebase from 'firebase';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import MultiSelect from 'react-native-multiple-select';
import { subjectIdName } from '../../components/questions/Subjects';
import { updateEditByTypeId } from '../../redux/actions';
import { connect } from 'react-redux';
import { getEditByTypeId } from '../../redux/selectors';
import { BackButton } from '../../components/common/BackButton';

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
            allLoading: true,
            gotData: false
        };
        this.submitQuestion = this.submitQuestion.bind(this);
        this.pickImage = this.pickImage.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.multiSelect;
        this.items = subjectIdName;
        this.handleSave = this.handleSave.bind(this);
    }

    componentDidMount() {
        // component does not unmount
        InteractionManager.runAfterInteractions(async () => {
            this.setState({ allLoading: false });
            this.getPhotoPermission();
        });
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
        if (subjects.length > 0 && subjects.length <= 3  && questionTitle.length > 0) {
            this.setState({ loading: true });

            const uid = firebase.auth().currentUser.uid;

            const remoteUri = image ? await this.uploadPhotoAsync(image, uid) : '';

            db.collection('questions').doc().set({
                subjects: subjects,
                questionTitle: questionTitle,
                questionText: questionText,
                dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
                //displayName: firebase.auth().currentUser.displayName,
                uid: uid,
                //userImage: firebase.auth().currentUser.photoURL,
                image: remoteUri,
                answersCount: 0,
                //userRef: db.doc('users/' + firebase.auth().currentUser.uid),
            })
            .then(() => {
                // questionRef.collection('likers').doc('--stats--').set({
                //     likesCount: 0
                // });
                console.log('Question Submitted.');
                this.setState({ loading: false, questionText: '', subjects: [], image: null }, () => {
                    this.props.navigation.navigate('QuestionsList', { refresh: true });
                });
            })
            .catch(error => {
                console.log(error.message);
                this.setState({ loading: false });
            });
        } else if (subjects.length > 3) {
            this.setState({ errorMessage: 'Too many subjects. Only a maximum of 3 are allowed.' });
        } else if (subjects.length == 0) {
            this.setState({ errorMessage: 'Please select a subject' });
        } else if (questionTitle.length == 0) {
            this.setState({ errorMessage: 'Question title is needed' });
        } else if (questionTitle.length >= 100) {
            this.setState({ errorMessage: 'Bad question title. Too many characters. Are you serious?' });
        }
    }

    onSelectedItemsChange = subjects => {
        this.setState({ subjects: subjects });
        //console.log(this.state.subjects);
    };

    removeImage() {
        this.setState({ image: '' });
    }

    // shouldComponentUpdate(nextProps) {
    //     //console.log(this.props.isEdit, this.state.gotData);
    //     if (this.props.isEdit && !this.state.gotData) {
    //         let edits = this.props.edits;
    //         this.setState({
    //             subjects: edits ? edits.data.subjects : [],
    //             questionTitle: edits ? edits.data.questionTitle : '',
    //             questionText: edits ? edits.data.questionText : '',
    //             allLoading: false,
    //             gotData: true
    //         });
    //     }
    //     return true;
    // }

    shouldComponentUpdate() {
        this.handleGetEdits();
        return true;
    }

    handleGetEdits() {
        if (this.props.isEdit && this.state.allLoading) {
            let edits = this.props.edits;
            this.setState({
                subjects: edits ? edits.data.subjects : [],
                questionTitle: edits ? edits.data.questionTitle : '',
                questionText: edits ? edits.data.questionText : '',
                allLoading: false,
                gotData: true
            });
        }
    }

    handleSave() {
        if (this.props.isEdit) {
            let data = {
                subjects: this.state.subjects,
                questionTitle: this.state.questionTitle,
                questionText: this.state.questionText,
                image: this.state.image
            };
            this.props.updateEditByTypeId('questions', this.props.id, data);
            Alert.alert(
                'Question saved',
                '',
                [
                    { text: 'Close', onPress: null },
                ],
                { cancelable: true },
            );
        }
    }

    render() {
        const { container, submitButton, submitText, submitLabel, textInput, imageContainer, imageButtons, imageButton } = styles;
        //console.log(this.state.subjects);
        //console.log(this.props.data);
        if (this.props.isEdit && this.props.navigation) {
            this.props.navigation.setOptions({
                headerRight: () => (
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={this.handleSave}>
                            <Ionicons size={30} name='ios-save' style={{ paddingHorizontal: 10, color: 'white' }} />
                        </TouchableOpacity>
                    </View>
                ),
                headerLeft: () => (
                    <BackButton
                        onPress={() => {
                            this.setState({
                                subjects: [],
                                questionTitle: '',
                                questionText: '',
                                loading: false,
                                errorMessage: '',
                                image: null,
                                gotData: false,
                                allLoading: true
                            }, () => {
                                this.props.navigation.goBack();
                            });
                        }}
                        size={30}
                    />
                )
            });
        }

        return (
            <Background>
                {this.state.allLoading
                ? <Loading size={'large'} />
                : <View style={container}>
                    <View>
                        <View>
                            <MultiSelect
                                hideTags
                                items={this.items}
                                uniqueKey="id"
                                ref={(component) => { this.multiSelect = component }}
                                onSelectedItemsChange={this.onSelectedItemsChange}
                                selectedItems={this.state.subjects}
                                selectText="Select a subject"
                                searchInputPlaceholderText="Search Subjects..."
                                onChangeInput={(text) => console.log(text)}
                                //altFontFamily="ProximaNova-Light"
                                tagRemoveIconColor="#CCC"
                                tagBorderColor="#CCC"
                                tagTextColor="#CCC"
                                selectedItemTextColor="#CCC"
                                selectedItemIconColor="#CCC"
                                itemTextColor="#000"
                                displayKey="name"
                                searchInputStyle={{ color: '#CCC', paddingVertical: 10 }}
                                submitButtonColor="#CCC"
                                submitButtonText="Enter"
                                styleItemsContainer={{ height: 200 }}
                                //styleTextDropdown={{}} // Select a subject text style
                                styleDropdownMenuSubsection={{ height: 50 }} // without this the dropdown button is not aligned
                                styleDropdownMenu={{ alignItems: 'center' }}
                            />
                        </View>
                        <View>
                            {this.multiSelect ? this.multiSelect.getSelectedItemsExt(this.state.subjects) : null}
                        </View>
                    </View>
                    <SafeAreaView style={{ flex: 1 }}>
                        <ScrollView>
                            <TextInput
                                placeholder='Question Title'
                                value={this.state.questionTitle}
                                onChangeText={questionTitle => this.setState({ questionTitle: questionTitle })}
                                autoCorrect={false}
                                style={textInput}
                                multiline={true}
                            />
                            <TextInput
                                placeholder='Question description (Optional)'
                                value={this.state.questionText}
                                onChangeText={questionText => this.setState({ questionText: questionText })}
                                autoCorrect={false}
                                style={textInput}
                                multiline={true}
                            />
                            <View style={imageContainer}>
                                <View style={imageButtons}>
                                    <TouchableOpacity onPress={this.pickImage} style={imageButton}>
                                        <Ionicons name='md-camera' size={32} color='#DBDBDB' />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={this.removeImage} style={imageButton}>
                                        <Ionicons name='md-trash' size={32} color='#DBDBDB' />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginHorizontal: 32, marginTop: 32, height: 150 }}>
                                    {this.state.image 
                                        ? <Image source={{ uri: this.state.image }} style={{ width: '100%', height: '100%'}} />
                                        : null
                                    }
                                </View>
                            </View>
                            <Text>{this.state.errorMessage}</Text>
                                {!this.state.loading ?
                                    <TouchableOpacity style={submitButton} onPress={this.submitQuestion}>
                                        <Text style={submitText}>Submit Question</Text>
                                    </TouchableOpacity>
                                    :
                                    <Loading size={'small'} />
                                }
                        </ScrollView>
                    </SafeAreaView>
                </View>
                }
            </Background>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 500,
        marginHorizontal: 16,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 40,
        //overflow: 'hidden',
        marginVertical: 14,
    },

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
        paddingVertical: 10,
        marginTop: 8,
        fontSize: 16,
        lineHeight: 23,
        borderBottomWidth: 1,
        borderColor: '#bbb',
    },


    submitButton: {
        paddingVertical: 18,
        borderRadius: 10,
        backgroundColor: '#467088',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 25
    },

    submitText: {
        fontSize: 18,
        color: '#fff',
    },

    response: {
        alignItems: 'center',
        justifyContent: 'center'
    },

    imageContainer: {
        justifyContent: 'center',
        alignItems: 'stretch',
        marginTop: 5
    },
    
    imageButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },

    imageButton: {
        marginRight: 8
    }
});


const mapStateToProps = (state, ownProps) => {
    if (ownProps.isEdit) {
        return {
            edits: getEditByTypeId(state, 'questions', ownProps.id)
        };
    } else {
        return {};
    }
};

export default connect(
    mapStateToProps,
    null
)(SubmitQuestionScreen);

// const mapStateToProps = state => {
//     return {
//         questions: state.QUESTIONS.questions
//     };
// };

// export default connect(
//     mapStateToProps,
//     { resetQuestions }
// )(SubmitQuestionScreen);

//export default SubmitQuestionScreen;

{/* <Modal
    animationType='slide'
    transparent={false}
    visible={this.props.modalVisible}
    supportedOrientations={['landscape', 'portrait']}
    onRequestClose={() => {
        console.log('Modal has been closed');
    }}
>    */}