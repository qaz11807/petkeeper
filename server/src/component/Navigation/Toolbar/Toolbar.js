import React from 'react';
import classes from './Toolbar.css';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import Toggle from '../Toggle/Toggle';

const toolbar = (props) => (
	<header className={classes.Toolbar}>
		<Toggle toggle={props.clicked}/>
		<Logo height="80%"/>
		<nav className={classes.DesktopOnly}>
			<NavigationItems/>
		</nav>
	</header>
);

export default toolbar;
