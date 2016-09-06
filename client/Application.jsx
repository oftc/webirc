/*global React, MainWindow */

var IRCStream = require('ircng');

class Application extends React.Component {
    constructor() {
        super();

        this.onMessage = this.onMessage.bind(this);
        this.onJoin = this.onJoin.bind(this);
        this.onChannelSelected = this.onChannelSelected.bind(this);
        this.onCommand = this.onCommand.bind(this);
        this.processCommand = this.processCommand.bind(this);

        this.state = {
            channels: {
                'status': {
                    key: 'status',
                    name: 'Status',
                    messages: [],
                    selected: true
                }
            }
        };

        this.stream = new IRCStream();
    }

    componentDidMount() {
        var socket = io.connect('https://webirc.oftc.net:8443');
        var nickAttempts = 1;

        this.stream.on('message', this.onMessage);
        this.stream.on('send', function(message) {
            socket.emit('message', message.message);
        });

        this.stream.on('join', this.onJoin);

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

    onJoin(joinMessage) {
        var channels = this.state.channels;
        var channelKey = joinMessage.channel.toLowerCase(); 

        channels[channelKey] = { key: channelKey, name: joinMessage.channel };

        this.setState({ channels: channels });
    }

    onMessage(message) {
        if(!message || !message.command) {
            return;
        }

        var channels = this.state.channels;
        var channel = {};

        if(!message.target) {
            channel = channels.status;
        } else {
            channel = channels[message.target];

            if(!channel) {
                channel = { messages: [] };
                channels[message.target] = channel;
            }
        }

        var date = moment().format('HH:mm:ss SSS');

        channel.messages.push({ timestamp: date, command: message.command, args: message.args || [] });

        this.setState({ channels: channels });
    }

    processCommand(commandLine) {
        if(!commandLine) {
            return false;
        }

        var split = commandLine.split(' ');

        var command = split[0];

        switch(command.toUpperCase()) {
            case 'JOIN':
                if(split.length < 2) {
                    return false;
                }

                this.stream.joinChannel(split[1]);
                break;
            default:
                return false;
        }

        return true;
    }

    onChannelSelected(channel) {
        var channels = this.state.channels;

        _.each(channels, function(c) {
            c.selected = false;
        });

        channels[channel].selected = true;

        this.setState({ channels: channels });
    }

    onCommand(command) {
        if(command[0] === '/') {
            this.processCommand(command.slice(1));
        }
    }

    render() {
        return (<MainWindow channels={ this.state.channels } onCommand={ this.onCommand } onChannelSelected={ this.onChannelSelected } />);
    }
}

if(!window.testing) {
    ReactDOM.render(<Application />, document.getElementById('component'));
}

Application.displayName = 'Application';
