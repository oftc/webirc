import React from 'react';
import IRCStream from 'ircng';
import MainWindow from './MainWindow.jsx';
import io from 'socket.io-client';
import moment from 'moment';
import _ from 'underscore';

class Irc extends React.Component {
    constructor() {
        super();

        this.onJoin = this.onJoin.bind(this);
        this.onChannelSelected = this.onChannelSelected.bind(this);
        this.onCommand = this.onCommand.bind(this);
        this.processCommand = this.processCommand.bind(this);
        this.onPrivmsg = this.onPrivmsg.bind(this);
        this.on353Numeric = this.on353Numeric.bind(this);
        this.onPart = this.onPart.bind(this);
        this.onQuit = this.onQuit.bind(this);
        this.onNumeric = this.onNumeric.bind(this);
        this.onCloseChannel = this.onCloseChannel.bind(this);
        this.onNick = this.onNick.bind(this);

        this.state = {
            channels: {
                'status': {
                    key: 'status',
                    name: 'Status',
                    messages: [],
                    users: [],
                    selected: true,
                    unreadCount: 0
                }
            }
        };

        this.stream = new IRCStream();
    }

    componentWillMount() {
        if(!this.state.nickname) {
            this.setState({ nickname: this.props.nickname || 'WebIRC' });
        }
    }

    componentDidMount() {
        var socket = io.connect('https://webirc.oftc.net:8443');
        var nickAttempts = 1;

        this.stream.setNickname(this.state.nickname);

        this.stream.on('send', function(message) {
            socket.emit('message', message.message);
        });

        this.stream.on('join', this.onJoin);
        this.stream.on('part', this.onPart);
        this.stream.on('quit', this.onQuit);
        this.stream.on('nick', this.onNick);
        this.stream.on('privmsg', this.onPrivmsg);
        this.stream.on('numeric', this.onNumeric);

        this.stream.on('433', () => {
            this.setState({ nickname: this.state.nickname + nickAttempts });
            this.stream.setNickname(this.state.nickname);
            nickAttempts++;
        });

        socket.on('error', function(error) {
            console.log('socket Error: ' + error);
        });

        socket.on('message', message => {
            this.stream.push(message);
        });

        socket.on('connect', () => {
            this.stream.register({ nick: this.state.nickname, username: 'WebIRC', realname: 'WebIRC User' });
        });

        socket.on('disconnect', function() {
            console.info('disconnected');
        });

        socket.on('reconnect', function() {
            console.info('reconnecting...');
        });

        window.onbeforeunload = function() {
            socket.disconnect();
        };
    }

    onJoin(joinMessage) {
        var channels = this.state.channels;
        var channelKey = joinMessage.channel.toLowerCase();
        var source = joinMessage.source.substr(0, joinMessage.source.indexOf('!'));

        if(source === this.state.nickname) {
            channels[channelKey] = { key: channelKey, name: joinMessage.channel, messages: [], users: [], unreadCount: 0 };
            _.each(channels, function(channel) {
                channel.selected = false;
            });

            channels[channelKey].selected = true;
        } else {
            this.addMessageToChannel(channelKey, '', [joinMessage.source + ' has joined ' + channelKey]);
            channels[channelKey].users.push(source);
        }

        this.setState({ channels: channels });
    }

    onPart(partMessage) {
        if(!partMessage) {
            return;
        }

        var channels = this.state.channels;
        var channelKey = partMessage.channel.toLowerCase();

        var source = partMessage.source.substr(0, partMessage.source.indexOf('!'));

        if(source === this.state.nickname) {
            delete channels[channelKey];

            _.each(channels, function(channel) {
                channel.selected = false;
            });

            channels.status.selected = true;
        } else {
            var channel = channels[channelKey];
            channel.users = _.reject(channel.users, function(user) {
                return user === source;
            });

            this.addMessageToChannel(channelKey, '', [partMessage.source + ' has left ' + channelKey]);
        }

        this.setState({ channels: channels });
    }

    onQuit(quitMessage) {
        if(!quitMessage) {
            return;
        }

        var source = quitMessage.source.substr(0, quitMessage.source.indexOf('!'));

        _.each(this.state.channels, channel => {
            var matchingUser = _.find(channel.users, function(user) {
                return user === source;
            });

            if(!matchingUser) {
                return;
            }

            channel.users = _.without(channel.users, matchingUser);

            this.addMessageToChannel(channel.key, '', [quitMessage.source + ' has quit: ' + quitMessage.message || '']);
        });
    }

    onNumeric(numeric) {
        if(!numeric || !numeric.number) {
            return;
        }

        switch(numeric.number) {
            case '332':
                this.on332Numeric(numeric.args);
                break;
            case '353':
                this.on353Numeric(numeric.args);
                break;
            default:
                this.addMessageToChannel('status', '', numeric.args);
                break;
        }
    }

    addMessageToChannel(channelKey, command, args) {
        var channels = this.state.channels;
        var channel = channels[channelKey];

        if(!channel) {
            channel = { key: channelKey, name: channelKey, messages: [] };
            channels[channelKey] = channel;
        }

        var date = moment().format('HH:mm:ss SSS');

        channel.messages.push({ timestamp: date, command: command, args: args || [] });
        if(!channel.selected) {
            channel.unreadCount++;
        }

        this.setState({ channels: channels });
    }

    onPrivmsg(message) {
        if(!message) {
            return;
        }

        var source = message.source.substr(0, message.source.indexOf('!'));
        var target = '';

        if(message.target[0] === '#') {
            target = message.target;
        } else if(message.target !== this.state.nickname) {
            target = 'status';
        } else {
            target = source;
        }

        this.addMessageToChannel(target, '', ['[' + message.source + '] ' + message.message]);
    }

    onNick(message) {
        if(!message) {
            return;
        }

        var source = message.source.substr(0, message.source.indexOf('!'));

        if(source === this.state.nickname) {
            this.setState({ nickname: message.newnick });
            this.addMessageToChannel('status', '', 'Nickname changed to ' + message.newnick);
            return;
        }

        var targetChannels = _.filter(this.state.channels, function(channel) {
            return _.any(channel.users, function(user) {
                return user === source;
            });
        });

        _.each(targetChannels, channel => {
            var channelKey = channel.key;

            channel.users = _.reject(channel.users, function(user) {
                return user === source;
            });

            channel.users.push(message.newnick);

            this.addMessageToChannel(channelKey, '', [message.source + ' is now known as ' + message.newnick]);
        });
    }

    on332Numeric(args) {
        if(!args) {
            return;
        }

        var channelKey = args[0];
        var channels = this.state.channels;

        var channel = channels[channelKey];

        channel.topic = args[1];

        this.setState({ channels: channels });
    }

    on353Numeric(args) {
        if(!args) {
            return;
        }

        var channelKey = args[1];
        var channels = this.state.channels;

        var channel = channels[channelKey];

        var users = args[2].split(' ');
        channel.users = _.union(channel.users, users);

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
            case 'J':
                if(split.length < 2) {
                    return false;
                }

                this.stream.joinChannel(split[1]);
                break;
            case 'PART':
            case 'LEAVE':
                var channel = '';

                if(split.length < 2) {
                    if(this.state.channels.status.selected) {
                        return false;
                    }

                    channel = _.find(this.state.channels, function(c) {
                        return c.selected;
                    }).name;
                } else {
                    if(!_.any(this.state.channels, function(c) {
                        return c.name.toLowerCase() === split[1].toLowerCase();
                    })) {
                        return false;
                    }

                    channel = split[1].toLowerCase();
                }

                this.stream.leaveChannel(channel);
                break;
            case 'MSG':
            case 'W':
            case 'M':
                if(split.length < 3) {
                    return false;
                }

                var message = split.slice(2).join(' ');

                this.stream.sendMessage(split[1], message);
                this.addMessageToChannel(split[1], '-> ', [message]);

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
        channels[channel].unreadCount = 0;

        this.setState({ channels: channels });
    }

    onCloseChannel(channel) {
        if(!channel) {
            return;
        }

        var channels = this.state.channels;

        delete channels[channel];

        _.each(channels, function(c) {
            c.selected = false;
        });

        channels.status.selected = true;

        if(channel[0] === '#') {
            this.stream.leaveChannel(channel);
        }

        this.setState({ channels: channels });
    }

    onCommand(command) {
        if(command[0] === '/') {
            this.processCommand(command.slice(1));
        } else if(!this.state.channels.status.selected) {
            var channel = _.find(this.state.channels, function(c) {
                return c.selected;
            }).name;

            this.stream.sendMessage(channel, command);
            this.addMessageToChannel(channel, '-> ', [command]);
        }
    }

    render() {
        return (<MainWindow channels={ this.state.channels }
            onCommand={ this.onCommand }
            onChannelSelected={ this.onChannelSelected }
            onCloseChannel={ this.onCloseChannel } />);
    }
}

Irc.displayName = 'Irc';
Irc.propTypes = {
    nickname: React.PropTypes.string
};

export default Irc;
