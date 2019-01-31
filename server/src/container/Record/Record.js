import React, { Component } from 'react';
import classes from './Record.css';
import List from '../../component/List/List';
import axios from "axios/index";

class Record extends Component {

	componentDidMount () {
        axios.get('/task/getLogs')
            .then(res => {
                var data = [];
                res.data.forEach(function(info){
                    data.push({
                        totaltime:new Date(info.startTime).toLocaleString(),
                        weight:info.parm.weight.label,
                        backtime:info.parm.back.label
                    });
                });
                this.setState({data:data});
            })
            .catch(err => {
                this.setState({error:true});
            });
	}

	state = {
		data:[]
	}

	render() {

		let list = this.state.data.map((key, i) => {
			return (<List key={i} totaltime={key['totaltime']} backtime={key['backtime']} weight={key['weight']}/>)
		})
		.reduce((ac, cr) => {
			return ac.concat(cr);
		}, [])

		return (
			<div className={classes.Record}>
				<div className={classes.ButtonHome}>
					{list}
				</div>
			</div>
		)
	}
}
export default Record;