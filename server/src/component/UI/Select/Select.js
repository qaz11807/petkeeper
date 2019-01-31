import React from 'react';
import Select from 'react-select';
import {TimePicker} from 'antd';
import Imgsrc1 from '../../../assets/clock.png';
import Imgsrc2 from '../../../assets/g.png';
import Imgsrc3 from '../../../assets/stop.png';
import classes from './Select.css';
import moment from 'moment';

const selectComponent = (props) => {

	let selectType = null;
	let text = "";
	let Imgsrc = "";

	const backOption = [
			{value: '1', label: '1分'},
			{value: '10', label: '10分'},
			{value: '15', label: '15分'}
		];
	const weightOption = [
			{value: '100g', label: '100g'},
			{value: '200g', label: '200g'},
			{value: '300g', label: '300g'},
			{value: '400g', label: '400g'},
			{value: '500g', label: '500g'}
		];

	switch(props.case){
		case '1':
			text = "請選擇放飼料的時間";
			selectType = <TimePicker style={{width:'100%'}} onChange={props.timeChange} defaultValue={moment(props.time,"HH:mm")} format="HH:mm" />;
			Imgsrc = Imgsrc1;
			break;
		case '2':
			text = "請選擇放多少飼料~";
			selectType = <Select options={weightOption} onChange={props.change}/>;
			Imgsrc = Imgsrc2;
			break;
		case '3':
			text = "要讓您的寵物吃多久呢?";
			selectType = <Select options={backOption} onChange={props.change}/>;
			Imgsrc = Imgsrc3;
			break;
		default:
			text = "megatron is coming";
			break;
	}

	return (
		<div className={classes.Select} style={{width: props.width}}>
			<h4>{text}</h4>
			<img src={Imgsrc} alt="default"/>
			{selectType}
		</div>
	)
}
export default selectComponent;