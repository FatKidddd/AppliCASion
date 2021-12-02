import React, { Component } from 'react';
import SubmitQuestion from '../questions/SubmitQuestion';
import { connect } from 'react-redux';

class EditQuestionScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        //console.log(this.props.id);
        return (
            <SubmitQuestion id={this.props.id} isEdit={true} navigation={this.props.navigation} />
        );
    }
};

const mapStateToProps = state => {
    return {
        id: state.EDITS.currentEditId
    };
};

export default connect(
    mapStateToProps,
    null
)(EditQuestionScreen)