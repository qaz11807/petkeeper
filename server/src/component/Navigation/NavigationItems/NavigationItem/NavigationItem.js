import React from 'react';
import { NavLink } from 'react-router-dom';
import classes from './NavigationItem.css';

const NavigationItem = (props) => (
	<li className={classes.NavigationItem}>
		<NavLink to={props.link} exact={true} activeStyle={{background: "#72DCEA"}}>{props.children}</NavLink>
	</li>
)

export default NavigationItem;