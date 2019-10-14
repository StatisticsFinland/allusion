import React, { Component } from 'react';
import { App } from './App';
import { BrowserRouter as Router, Route } from 'react-router-dom';

/* Gateway -component works as a proxy between App and outer realms */
class Gateway extends Component {
    render() {
        return (
            /* In the future there might be other resources other than the root */
            <Router>
                <Route exact path='/' component={App}/>
            </Router>
        );
    }
}

export default Gateway;
