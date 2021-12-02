import React, { Component } from 'react';
import { FlatList, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, Dimensions, View } from 'react-native';
import { Loading, Background } from '../../components/common'
import { connect } from 'react-redux';
import Answer from '../../components/questions/Answer';
import { getAnswers, overwriteAnswers } from '../../redux/actions';
import { getAnswersByQuestionId, getQuestionById } from '../../redux/selectors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
//import Search from './Search';
import db from '../../../Fire';
import Question from '../../components/questions/Question';
import SubmitAnswerScreen from './SubmitAnswer';

// changed screen props to redux
class AnswersListScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //allLoading: true,
            loading: false,
            onEndReachedCalledDuringMomentum: true,
            refreshing: false,
            modalVisible: false
        };
        this.answerRef, this.questionId, this.question;       
        this.onRefresh = this.onRefresh.bind(this);
	}

    async shouldComponentUpdate(nextProps, nextState) {
        // because there will always be route.params due to reliance on questionId
        if (nextProps.route.params.refresh != null) {
            //this.setState({ allLoading: true });
            //await this.props.overwriteAnswers(this.answerRef, this.questionId);
            //this.setState({ allLoading: false });
            this.onRefresh();
            nextProps.route.params.refresh = null;
        }
        if (nextProps.answers != this.props.answers && this.state.loading) {
            this.setState({ loading: false });
        } else if (this.state.loading) {
            setTimeout(() => {
                this.setState({ loading: false });
            }, 500);
        }
        return true;
    }

    async componentDidMount() {
        if (this.props.route.params != null) {
            this.questionId = this.props.route.params.questionId;
            this.question = <Question
                questionId={this.questionId}
                questionTitle={this.props.question.questionTitle}
                questionText={this.props.question.questionText}
                dateCreated={this.props.question.dateCreated.seconds}
                subjects={this.props.question.subjects}
                displayName={this.props.question.displayName}
                userImage={this.props.question.profilePicture}
                image={this.props.question.image}
            />;
            this.answerRef = db.collection('questions').doc(this.questionId).collection('answers');
            if (this.props.answers.length === 0) {
                this.setState({ loading: true });
                await this.props.getAnswers(this.answerRef, this.questionId);
            }
            //this.setState({ allLoading: false });
        } else {
            this.props.navigation.navigate('QuestionsList');
        }
    }

    componentWillUnmount() {

    }

    _onMomentumScrollBegin = () => this.setState({ onEndReachedCalledDuringMomentum: false });

    _loadMoreData = () => {
        if (!this.state.onEndReachedCalledDuringMomentum && !this.state.loading) {
            this.setState({ onEndReachedCalledDuringMomentum: true, loading: true }, async () => {
                await this.props.getAnswers(this.answerRef, this.questionId);
            });
        };
    };

    renderFooter() {
        if (this.state.loading) return <Loading size='small' style={{ height: 100 }} />
        return null;
    }

    wait(timeout) {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    async onRefresh() {
        this.setState({ refreshing: true });
        await this.props.overwriteAnswers(this.answerRef, this.questionId);
        this.wait(1000).then(this.setState({ refreshing: false }));
    }

    render() {
        this.props.navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    style={{ paddingLeft: 20 }}
                    onPress={() => {
                        this.props.navigation.navigate('QuestionsList');
                    }}
                >
                    <Ionicons size={30} name='ios-arrow-back' style={{ color: 'white' }} />
                </TouchableOpacity>
            ),
        });

        return (
            <Background>
                {this.state.allLoading
                    ? <View style={{ marginTop: 100 }}><Loading size={'large'} /></View>
                    : <SafeAreaView style={styles.container}>
                        <FlatList
                            data={this.props.answers}
                            renderItem={({ item, index }) =>
                                <Answer
                                    key={'listAnswer-' + item.id}
                                    questionId={this.questionId}
                                    answerId={item.id}
                                    answerText={item.answerText}
                                    dateCreated={item.dateCreated.seconds}
                                    subject={item.subject}
                                    displayName={item.displayName}
                                    userImage={item.profilePicture}
                                    image={item.image}
                                />
                                // <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1}}>
                                //     <Text>Hi</Text>
                                // </View>
                            }
                            keyExtractor={item => 'listAnswer-' + item.id}
                            onEndReached={() => this._loadMoreData()}
                            onEndReachedThreshold={0}
                            onMomentumScrollBegin={() => this._onMomentumScrollBegin()}
                            initialNumToRender={5}
                            keyboardShouldPersistTaps={'handled'}
                            ListFooterComponent={this.renderFooter.bind(this)}
                            ListHeaderComponent={this.question}
                            refreshControl={
                                <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                            }
                        />
                        <SubmitAnswerScreen
                            questionId={this.questionId}
                            navigation={this.props.navigation}
                            handleOverwriteAnswers={this.handleOverwriteAnswers}
                        />
                    </SafeAreaView>
                }
            </Background>
        );
    }
};

const mapStateToProps = (state, ownProps) => {
    if (ownProps.route.params != null) {
        return {
            answers: getAnswersByQuestionId(state, ownProps.route.params.questionId).answers,
            question: getQuestionById(state, ownProps.route.params.questionId),
            users: state.USER.users
        };
    } else {
        //console.log('wtf');
        return {
            answers: []
        };
    }
};

export default connect(
    mapStateToProps,
    { getAnswers, overwriteAnswers }
)(AnswersListScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    },

    answer: {
        fontSize: 20,
    },

    subject: {
        fontSize: 18,
        textDecorationLine: "underline",
        marginBottom: 10,
    },

    created: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    createdText: {
        fontSize: 12,
        fontWeight: '100',
    },

    owner: {
        fontSize: 14,
        marginBottom: 10,
    },

    interactive: {

    },

    answer: {
        fontSize: 18,
        fontWeight: '300',
    },
});


// async getDefaultImage() {
    //     const imageRef = firebase.storage().ref("profiles/default.png");
    //     const url = await imageRef.getDownloadURL();
    //     return url
    // }

    // async handleData(doc) {
    //     return new Promise(async resolve => {
    //         let item = doc.data();
    //         item.id = doc.id;
    //         const user = this.props.users[item.uid];
    //         if (!user) {
    //             //console.log('Called user data');
    //             const userRef = db.collection('users').doc(item.uid);
    //             await userRef.get()
    //                 .then(async response => {
    //                     const data = response.data();
    //                     const img = data.profilePicture ? data.profilePicture : await this.getDefaultImage();
    //                     item.profilePicture = img;
    //                     item.displayName = data.displayName;
    //                 }).catch(async err => {
    //                     const url = await this.getDefaultImage();
    //                     item.displayName = 'Anonymous';
    //                     item.profilePicture = url;
    //                 });
    //             const data = {
    //                 profilePicture: item.profilePicture,
    //                 displayName: item.displayName
    //             }
    //             this.props.getUsers(item.uid, data);
    //         } else {
    //             item.profilePicture = user.profilePicture;
    //             item.displayName = user.displayName;
    //         }
    //         //console.log('pushed');
    //         //console.log(item);
    //         resolve(item);
    //     });
    // }

    // getAnswers = async (start = this.props.lastVisible) => {
    //     if (this.answerRef) {
    //         this.setState({ loading: true });
    //         let queries;
    //         if (start == null) { queries = this.answerRef.orderBy('dateCreated').limit(5) }
    //         else { queries = this.answerRef.orderBy('dateCreated').startAfter(start).limit(5); }
    //         let answers = [];
    //         let lastVisible;
    //         await queries.get()
    //             .then(async (res) => {
    //                 lastVisible = res.docs[res.docs.length - 1];
    //                 let actions = res.docs.map(doc => this.handleData(doc));
    //                 let results = Promise.all(actions);
    //                 await results.then(data => {
    //                     //console.log(data);
    //                     answers = data;
    //                 });
    //             });
    //         //console.log('returned');
    //         //console.log(answers);
    //         return { answers, lastVisible };
    //     }
    // }

    // async handleAddAnswers() {
    //     await this.getAnswers()
    //         .then(({ answers, lastVisible }) => {
    //             if (lastVisible != null && answers.length > 0) {
    //                 this.props.getAnswers(this.questionId, lastVisible, answers);
    //             } else {
    //                 // say that theres no more answers?
    //             }
    //         });
    // }

    // async handleOverwriteAnswers() {
    //     await this.getAnswers(null)
    //         .then(({ answers, lastVisible }) => {
    //             this.props.overwriteAnswers(this.questionId, lastVisible, answers);
    //         });
    // }