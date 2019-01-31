import React from 'react';
import Imgsrc1 from '../../../assets/auto.PNG';
import Imgsrc2 from '../../../assets/record.PNG';
import Imgsrc3 from '../../../assets/manual.PNG';
import Imgsrc4 from '../../../assets/info.PNG';
import classes from './PetBlock.css';

const petblock = (props) => {

	let classMix = [classes.PetBlock];
	let Imgsrc;

	switch(props.img) {
		case "1":
			Imgsrc = Imgsrc1;
			classMix = [classes.PetBlock, classes.auto];
			break;
		case "2":
			Imgsrc = Imgsrc2;
			classMix = [classes.PetBlock, classes.record];
			break;
		case "3":
			Imgsrc = Imgsrc3;
			classMix = [classes.PetBlock, classes.manual];
			break;
		case "4":
			Imgsrc = Imgsrc4;
			classMix = [classes.PetBlock, classes.info];
			break;
		default:
			console.log('megatron wants his crew');
	}

	return (
		<div className={classMix.join(' ')} onClick={props.go}>
			<p>{props.text}</p>
			<img src={Imgsrc} alt="default"/>
		</div>
	)
}

export default petblock;