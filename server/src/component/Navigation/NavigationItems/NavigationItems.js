import React from 'react';
import classes from './NavigationItems.css';
import NavigationItem from './NavigationItem/NavigationItem';

const NavigationItems = (props) => (
	<ul className={classes.NavigationItems}>
		<NavigationItem link="/" active>MENU</NavigationItem>
		<NavigationItem link="/auto"> Automatic</NavigationItem>
		<NavigationItem link="/record"> Record</NavigationItem>
		<NavigationItem link="/manual"> Manual</NavigationItem>
		<NavigationItem link="/info"> Info</NavigationItem>
	</ul>
);

export default NavigationItems;