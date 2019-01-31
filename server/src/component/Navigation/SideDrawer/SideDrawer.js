import React from 'react';
import classes from './SideDrawer.css';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import Backdrop from '../../UI/Backdrop/Backdrop';
import Aux from '../../../hoc/Auxiliary';

const sideDrawer = (props) => {
	let toggleSideDrawer = [classes.SideDrawer, classes.Close];
	if(props.open) {
		toggleSideDrawer = [classes.SideDrawer, classes.Open];
	}
	return (
		<Aux>
			<Backdrop show={props.open} clicked={props.closed}/>
			<div className={toggleSideDrawer.join(' ')}>
				<Logo height="11%"/>
				<nav>
					<NavigationItems />
				</nav>
			</div>
		</Aux>
	)
}

export default sideDrawer;