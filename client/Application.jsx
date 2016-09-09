import React from 'react';
import {render} from 'react-dom';
import Login from './Login.jsx';
import Irc from './Irc.jsx';

class Application extends React.Component {
    constructor() {
        super();

        this.onStateChanged = this.onStateChanged.bind(this);

        this.state = { appState: 'login', stateArg: '' };
    }

    onStateChanged(newState, stateArg) {
        this.setState({ appState: newState, stateArg: stateArg });
    }

    render() {
        var component = this.state.appState === 'login' ? <Login onStateChanged={ this.onStateChanged } /> : <Irc nickname={ this.state.stateArg } />;
        
        return (<div>
            { component }
        </div>);
    }
}

if (!window.__karma__) {
    render(<Application />, document.getElementById('component'));
}

Application.displayName = 'Application';

export default Application;
