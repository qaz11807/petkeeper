import React, { Component } from 'react';
import classes from './Manual.css';
import SelectComponent from '../../component/UI/Select/Select';
import List from '../../component/List/List';
import axios from "axios/index";

class Manual extends Component {

	componentDidMount () {
        axios.get('/task/getStates')
            .then(res => {
                this.setState({switchState: res.data.onOff==1?true:false})
            })
            .catch(err => {
                this.setState({error:true});
            });
	}
	//更改 state 必須用 react 專屬函式 setState()
	state = {
		weightSelect:"", // 格式 : {value: "300g", label: "300g"}
		backtimeSelect:"",// 格式 : {value: "15", label: "15分"}  下方的list有用到 .label
		switchState:false // true = 飼料盒是開的
	}

	weightOnChange = weightSelect => this.setState({weightSelect});

	backtimeOnChange = backtimeSelect => this.setState({backtimeSelect});

	backCommand = () => {
		// 按下收回按鈕
		this.setState({switchState: false});
		console.log('megatron coming home');
	};

	sureCommand = () => {
		var self = this;
		if (this.state.weightSelect !== "" && this.state.backtimeSelect !== "") {
            axios.post('/task/addSingleTask',{
                weight:this.state.weightSelect,
                back:this.state.backtimeSelect
            } )
                .then(function (response) {
                    self.setState({switchState:true});
                })
                .catch(function (error) {
                    console.log(error);
                });
		} else {
			alert('有地方沒填到喔');
		}
		console.log(this.state.weightSelect,this.state.backtimeSelect);
	};

	render() {
		return (
			<div className={classes.Manual}>
				<SelectComponent case="2" width='40%' Stype="picker" change={this.weightOnChange}/>
				<SelectComponent case="3" width='40%' Stype="picker" change={this.backtimeOnChange}/>
				<div className={classes.ButtonHome}>
					<div className={classes.Button} onClick={this.sureCommand}>OK</div>
					<div className={classes.Button} onClick={this.backCommand}>收回</div>
				</div>
				<List switchState={this.state.switchState} backtimeSelect={this.state.backtimeSelect.label}/>
			</div>
		)
	}
}
export default Manual;