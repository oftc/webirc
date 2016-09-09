import React from 'react';
import {render} from 'react-dom';
import Login from './Login.jsx';
import Irc from './Irc.jsx';
import $ from 'jquery';

class Application extends React.Component {
    constructor() {
        super();

        this.onStateChanged = this.onStateChanged.bind(this);

        this.state = { appState: 'login', stateArg: '' };
    }

    componentWillMount() {
        var nickname = $.getUrlVar('nickname');
        if(nickname) {
            this.setState({ appState: 'irc', stateArg: nickname });
        }
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

$.extend({
    getUrlVars: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }

        return vars;
    },
    getUrlVar: function (name) {
        return $.getUrlVars()[name];
    }
});

if (!window.__karma__) {
    render(<Application />, document.getElementById('component'));
}

Application.displayName = 'Application';

export default Application;
