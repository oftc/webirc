/*global React */
'use strict';

var IRCStream = require('ircng');

class Application extends React.Component {
    constructor() {
        super();

        this.onMessage = this.onMessage.bind(this);

        this.state = {
            messages: [],
            channels: [ { 
                name: 'Status'
            }]
        }
    }

    onMessage(message) {
        var messages = this.state.messages;

        var date = moment().format('HH:mm:ss SSS');

        messages.push({ timestamp: date, command: message.command, args: message.args });
        
        this.setState({ messages: messages });
    }

    componentDidMount() {
        var socket = io.connect('https://webirc.oftc.net:8443');
        var stream = new IRCStream();
        var nickAttempts = 1;

        stream.on('message', this.onMessage);
        stream.on('send', function(message) {
            socket.emit('message', message.message);
        });

        stream.on('433', function(message) {
            stream.setNickname('WebIRC' + nickAttempts);
            nickAttempts++;
        });

        socket.on('error', function(error) {
            console.log('socket Error: ' + error);
        });

        socket.on('message', function(message) {
            stream.push(message);
        });

        socket.on('connect', function(socket) {
            stream.register();
            console.info('connected');
        });

        socket.on('disconnect', function() {
            console.info('disconnected');
        });

        window.onbeforeunload = function (e) {
            socket.disconnect();
        }
    }

    render() {
        return (<MainWindow messages={ this.state.messages } channels={ this.state.channels } />);
    }
}

ReactDOM.render(<Application />, document.getElementById('component'));

Application.displayName = 'Application';