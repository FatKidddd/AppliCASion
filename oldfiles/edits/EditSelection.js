import React, { Component } from 'react';
import { Text, View, StyleSheet, Image, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Background } from '../../components/common';
import { connect } from 'react-redux';

class EditSelectionScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

    }

    render() {
        return (
            <Background>
                <View style={{ flex: 1 }}>
                    <View>
                        <Text>Questions</Text>
                        <View>
                            
                        </View>
                        <View>
                            <Text>Answers</Text>
                            <View>
                                
                            </View>
                        </View>
                    </View>
                </View>
            </Background>
        )
    }
}

const mapStateToProps = state => {
    return {
        edits: state.EDITS.edits
    };
}

export default connect(
    mapStateToProps,
    null
)(EditSelectionScreen);