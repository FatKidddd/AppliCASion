import React, { Component } from 'react';
import { Text, View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Loading, Background } from '../../components/common'
import { connect } from 'react-redux';
import Question from '../../components/questions/Question';
import { getQuestions, overwriteQuestions, getUsers } from '../../redux/actions';
//import Search from './Search';
import db from '../../../Fire';

// replaced resetQuestions with overwriteQuestions
class QuestionsListScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			allLoading: true,
			loading: false,
			onEndReachedCalledDuringMomentum: true,
			refreshing: false
		};
		this.onRefresh = this.onRefresh.bind(this);
		this.questionRef = db.collection('questions');
	}

	async shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.route.params != null) {
			this.onRefresh();
			nextProps.route.params = null;
		}
		if (nextProps.questions != this.props.questions && this.state.loading) {
			this.setState({ loading: false });
		}
		// } else if (this.state.loading) {
		// 	setTimeout(() => {
		// 		this.setState({ loading: false });
		// 	}, 800);
		// }
		return false;
	}

	async componentDidMount() {
		if (this.props.questions.length == 0) {
			this.setState({ loading: true });
			await this.props.getQuestions(this.questionRef);
		}
		this.setState({ allLoading: false });
	}

	_onMomentumScrollBegin = () => this.setState({ onEndReachedCalledDuringMomentum: false });

	_loadMoreData = () => {
		//!this.state.onEndReachedCalledDuringMomentum && 
		if (!this.state.loading) {
			this.setState({ onEndReachedCalledDuringMomentum: true, loading: true }, async () => {
				await this.props.getQuestions(this.questionRef);
			});
		};
	};

	// shifted all data management to redux

	renderFooter() {
		if (this.state.loading) return <Loading size='small' style={{ height: 100 }}/>
		return null;
	}

	wait(timeout) {
		return new Promise(resolve => {
			setTimeout(resolve, timeout);
		});
	}

	async onRefresh() {
		this.setState({ refreshing: true });
		await this.props.overwriteQuestions(this.questionRef);
		console.log('Refreshed');
		this.wait(1000).then(this.setState({ refreshing: false }));
	}

	render() {
		return (
			<Background>
				{this.state.allLoading
					? <View style={{ marginTop: 100 }}><Loading size={'large'} /></View>
					: <SafeAreaView style={styles.container}>
						<FlatList
							data={this.props.questions}
							renderItem={({ item, index }) => 
								<Question 
									key={'listQuestion-' + item.id}
									questionId={item.id}
									questionTitle={item.questionTitle}
									questionText={item.questionText} 
									dateCreated={item.dateCreated.seconds} 
									subjects={item.subjects} 
									displayName={item.displayName}
									userImage={item.profilePicture}
									image={item.image}
									answersCount={item.answersCount}
									navigate={() => {
										this.props.navigation.navigate('AnswersList');
									}}
								/>
							}
							keyExtractor={item => 'listQuestion-' + item.id}
							onEndReached={() => this._loadMoreData()}
							onEndReachedThreshold={1}
							onMomentumScrollBegin={() => this._onMomentumScrollBegin()}
							initialNumToRender={5}
							keyboardShouldPersistTaps={'handled'}
							ListFooterComponent={this.renderFooter.bind(this)}
							refreshControl={
								<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
							}
						/>
					</SafeAreaView>
				}
			</Background>
		);
	}
};

const mapStateToProps = state => {
	return {
		questions: state.QUESTIONS.questions,
		lastVisible: state.QUESTIONS.lastVisible,
	};
};

export default connect(
	mapStateToProps,
	{ getQuestions, overwriteQuestions, getUsers }
)(QuestionsListScreen);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%'
	},
});
{/* <Search modalVisible={this.state.searchOpen} handleSearchOpen={this.handleSearchOpen} handleFilter={this.handleFilter} /> */ }

// async getDefaultImage() {
	// 	const imageRef = firebase.storage().ref("profiles/default.png");
	// 	const url = await imageRef.getDownloadURL();
	// 	return url
	// }

	// async handleData(doc) {
	// 	return new Promise(async resolve => {
	// 		let item = doc.data();
	// 		item.questionId = doc.id;
	// 		const user = this.props.users[item.uid];
	// 		if (!user) {
	// 			//console.log('Called user data');
	// 			const userRef = db.collection('users').doc(item.uid);
	// 			await userRef.get()
	// 				.then(async response => {
	// 					const data = response.data();
	// 					const img = data.profilePicture ? data.profilePicture : await this.getDefaultImage();
	// 					item.profilePicture = img;
	// 					item.displayName = data.displayName;
	// 				}).catch(async err => {
	// 					const url = await this.getDefaultImage();
	// 					item.displayName = 'Anonymous';
	// 					item.profilePicture = url;
	// 				});
	// 			const data = {
	// 				profilePicture: item.profilePicture,
	// 				displayName: item.displayName
	// 			}
	// 			this.props.getUsers(item.uid, data);
	// 		} else {
	// 			item.profilePicture = user.profilePicture;
	// 			item.displayName = user.displayName;
	// 		}
	// 		//console.log('pushed');
	// 		resolve(item);
	// 	});
	// }

	// getQuestions = async(start=this.props.lastVisible) => {
	// 	this.setState({ loading: true });
	// 	let queries;
	// 	if (start == null) { queries = questionRef.orderBy('dateCreated').limit(2) }
	// 	else { queries = questionRef.orderBy('dateCreated').startAfter(start).limit(2); }
	// 	let questions = [];
	// 	let lastVisible;
	// 	await queries.get()
	// 		.then(async (res) => {
	// 			lastVisible = res.docs[res.docs.length - 1];
	// 			let actions = res.docs.map(doc => this.handleData(doc));
	// 			let results = Promise.all(actions);
	// 			await results.then(data => {
	// 				questions = data;
	// 			});
	// 		});
	// 	//console.log('returned');
	// 	return { questions, lastVisible };
	// }

	// async getQuestions() {
	// 	await this.getQuestions()
	// 		.then(({ questions, lastVisible }) => {
	// 			if (lastVisible != null) {
	// 				this.props.getQuestions(questions, lastVisible);
	// 			} else {
	// 				// say that theres no more questions?
	// 			}
	// 		});
	// }

	// async handleOverwriteQuestions() {
	// 	await this.getQuestions(null)
	// 		.then(({ questions, lastVisible }) => {
	// 			this.props.overwriteQuestions(questions, lastVisible);
	// 		});
	// }
