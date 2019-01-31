import React from 'react';
import Aux from '../../hoc/Auxiliary';
import classes from './List.css';

const list = (props) => {

	let listContent = "";

	if(props.time != null && props.weight != null && props.back != null){
		listContent = (
			<Aux>
				<p>每天的指定時間: {props.time}</p>
				<p>要餵食: <strong>{props.weight}</strong> </p>
				<p>{props.back} 分後收回</p>
			</Aux>
		);
	} else if (props.totaltime != null && props.weight != null && props.backtime != null) {
		listContent = (
			<Aux>
				<p>餵食時間: {props.totaltime}</p>
                <p>用餐時長: {props.backtime}</p>
				<p>吃了多少: <strong>{props.weight}</strong> </p>
			</Aux>
		);
	} else {
		if(props.switchState){
			listContent = (
				<Aux>
					<p>現在飼料盒是 <strong>開啟</strong> 的狀態 </p>
					<p>預計再<strong>{props.backtimeSelect}</strong> 後關閉 </p>
				</Aux>
			)
		} else {
			listContent = <p>現在飼料盒是 <strong>關閉</strong> 的狀態 </p>;
		}
	}

	return (
		<div className={classes.List}>
			{listContent}
		</div>
	)
}

export default list;