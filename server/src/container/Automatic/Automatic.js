import React, { Component } from 'react';
import classes from './Automatic.css';
import List from '../../component/List/List';
import axios from 'axios';

import SelectComponent from '../../component/UI/Select/Select';

class Automatic extends Component {

	componentDidMount () {
		 axios.get('/task/getAllTask')
		 .then(res => {
		 	res.data.forEach(function(dev){
		 		dev.time = new Date(dev.time).toLocaleTimeString();
                dev.back = dev.back.value;
                dev.weight = dev.weight.value;
			})
		 	this.setState({lists: res.data})
		 })
		 .catch(err => {
		 	this.setState({error:true});
		 });
	}

	state = {
		time: '10:30', // 選擇器初始時間 一般會訂再現在時間 + 10分鐘
		weightSelect:{value: "100g", label: "300g"}, // 格式 : {value: "300g", label: "300g"}
		backtimeSelect:{value: "1", label: "1分"},// 格式 : {value: "15", label: "15分"}
		lists:[] // 下方每天餵食排程 "HH:MM" 不須日期
	}

	timeOnChange = time => this.setState({time});

	weightOnChange = weightSelect => this.setState({weightSelect});

	backtimeOnChange = backtimeSelect => this.setState({backtimeSelect});

	buttonCheck = () => {
		var self = this;

        axios.post('/task/addCycleTask',{
        		time:this.state.time,
				weight:this.state.weightSelect,
				back:this.state.backtimeSelect
			} )
            .then(function (response) {
                axios.get('/task/getAllTask')
                    .then(res => {
                        res.data.forEach(function(dev){
                            dev.time = new Date(dev.time).toLocaleTimeString();
                            dev.back = dev.back.value;
                            dev.weight = dev.weight.value;
                        })
                        self.setState({lists: res.data})
                    })
                    .catch(err => {
                        self.setState({error:true});
                    });
            })
            .catch(function (error) {
                console.log(error);
            });
	}

	render() {

		let list = this.state.lists.map((key, i) => {
			return (<List key={i} time={key['time']} back={key['back']} weight={key['weight']}/>)
		})
		.reduce((ac, cr) => {
			return ac.concat(cr);
		}, [])

		return (
			<div className={classes.Automatic}>
				<SelectComponent case="1" width='30%' Stype="time" timeChange={this.timeOnChange} time={this.state.time}/>
				<SelectComponent case="2" width='30%' Stype="picker" change={this.weightOnChange}/>
				<SelectComponent case="3" width='30%' Stype="picker" change={this.backtimeOnChange}/>
				<div className={classes.ButtonHome}>
					<div className={classes.Button} onClick={this.buttonCheck}>確認</div>
				</div>
				<div className={classes.ButtonHome}>
					{list}
				</div>
			</div>
		)
	}
}
export default Automatic;