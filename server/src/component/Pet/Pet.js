import React from 'react';
import PetBlock from './PetBlock/PetBlock';
import classes from './Pet.css';

const pet = (props) => {

	return (
		<div className={classes.Pet}>
			<PetBlock img="1" text="automatic setting" go={props.auto}/>
			<PetBlock img="2" text="feeding record" go={props.record}/>
			<PetBlock img="3" text="manual setting" go={props.man}/>
			<PetBlock img="4" text="another info" go={props.info}/>
		</div>
	)
}

export default pet;