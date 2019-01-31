import React from 'react';
import Imgsrc from '../../assets/Gu4.PNG';
import classes from './Logo.css';

const logo = (props) => (
	<div className={classes.Logo} style={{height: props.height}}>
		<img src={Imgsrc} alt="default" />
	</div>
)
export default logo;