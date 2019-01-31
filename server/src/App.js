import React, { Component } from 'react';
import Layout from './component/Layout/Layout'
import PetBuilder from './container/PetBuilder/PetBuilder';
import { Route, Switch } from 'react-router-dom';
import Automatic from './container/Automatic/Automatic';
import Manual from './container/Manual/Manual';
import Record from './container/Record/Record';
class App extends Component {
  render() {
    return (
      <div>
        <Layout>
	        <Switch>
	        	<Route path="/" exact component={PetBuilder}/>
	        	<Route path="/auto" component={Automatic}/>
            <Route path="/manual" component={Manual}/>
            <Route path="/record" component={Record}/>
	        </Switch>
        </Layout>
      </div>
    );
  }
}

export default App;
