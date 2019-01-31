import React, { Component } from 'react';
// import Aux from "../../hoc/Auxiliary";
import Pet from "../../component/Pet/Pet";

class PetBuilder extends Component {
	state = {};

	gotoAutolink = () => {
		this.props.history.push('/auto');
	}

	gotoManlink = () => {
		this.props.history.push('/manual');
	}

	gotoRecordlink = () => {
		this.props.history.push('/record');
	}

	gotoInfolink = () => {
		this.props.history.push('/info');
	}

	render () {
		return (
			<Pet auto={this.gotoAutolink} man={this.gotoManlink} record={this.gotoRecordlink} info={this.gotoInfolink}/>
		)
	}
}

export default PetBuilder;