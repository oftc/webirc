/*global React */
'use strict';

var IRCStream = require('ircng');

class Application extends React.Component {
    constructor() {
        super();

        this.onMessage = this.onMessage.bind(this);
        this.onCommand = this.onCommand.bind(this);
        this.processCommand = this.processCommand.bind(this);

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
        this.stream = new IRCStream();
        var nickAttempts = 1;

        this.stream.on('message', this.onMessage);
        this.stream.on('send', function(message) {
            socket.emit('message', message.message); 
        });
        this.stream.on('join', joinMessage => {
            var channels = this.state.channels;

            channels.push({ name: joinMessage.channel });

            this.setState({ channels: channels });
        });

        this.stream.on('433', message => {
            this.stream.setNickname('WebIRC' + nickAttempts);
            nickAttempts++;
        });

        socket.on('error', function(error) {
            console.log('socket Error: ' + error);
        });

        socket.on('message', message => {
            this.stream.push(message);
        });

        socket.on('connect', socket => {
            this.stream.register();
            console.info('connected');
        });

        socket.on('disconnect', function() {
            console.info('disconnected');
        });

        window.onbeforeunload = function(e) {
            socket.disconnect();
        }
    }

    processCommand(commandLine) {
        var split = commandLine.split(' ');

        var command = split[0];

        switch(command.toUpperCase()) {
            case 'JOIN':
                this.stream.joinChannel(split[1]);
                break;
        }
    }

    onCommand(command) {
        if(command.startsWith('/')) {
            this.processCommand(command.slice(1));
        }
    }

    render() {
        return (<MainWindow messages={ this.state.messages } channels={ this.state.channels } onCommand={ this.onCommand } />);
    }
}

ReactDOM.render(<Application />, document.getElementById('component'));

Application.displayName = 'Application';