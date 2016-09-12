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
        this.selectChannel = this.selectChannel.bind(this);

        this.state = {
            channels: {
                'status': this.buildNewChannel('status', 'Status', true)
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

    buildNewChannel(key, name, selected) {
        return { key: key, name: name, messages: [], users: [], unreadCount: 0, selected: selected || false };
    }

    selectChannel(channelKey) {
        var channels = this.state.channels;

        _.each(channels, function(channel) {
            channel.selected = false;
        });

        channels[channelKey].selected = true;
    }

    onJoin(joinMessage) {
        var channels = this.state.channels;
        var channelKey = joinMessage.channel.toLowerCase();

        if(joinMessage.source.nick === this.state.nickname) {
            channels[channelKey] = this.buildNewChannel(channelKey, joinMessage.channel);
            this.selectChannel(channelKey);
        } else {
            this.addMessageToChannel(channelKey, '', [joinMessage.source.nick + ' has joined ' + channelKey]);
            channels[channelKey].users.push(joinMessage.source);
        }

        this.setState({ channels: channels });
    }

    onPart(partMessage) {
        if(!partMessage) {
            return;
        }

        var channels = this.state.channels;
        var channelKey = partMessage.channel.toLowerCase();

        if(partMessage.source.nick === this.state.nickname) {
            delete channels[channelKey];

            this.selectChannel('status');
        } else {
            var channel = channels[channelKey];
            channel.users = _.reject(channel.users, function(user) {
                return user.nick === partMessage.source.nick;
            });

            this.addMessageToChannel(channelKey, '', [partMessage.source.nick + ' has left ' + channelKey]);
        }

        this.setState({ channels: channels });
    }

    onQuit(quitMessage) {
        if(!quitMessage) {
            return;
        }

        _.each(this.state.channels, channel => {
            var matchingUser = _.find(channel.users, function(user) {
                return user.nick === quitMessage.source.nick;
            });

            if(!matchingUser) {
                return;
            }

            channel.users = _.without(channel.users, matchingUser);

            this.addMessageToChannel(channel.key, '', [quitMessage.source.nick + ' has quit: ' + quitMessage.message || '']);
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
            case '366':
                // ignored numerics
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
            channel = this.buildNewChannel(channelKey, channelKey);
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

        var target = '';

        if(message.target[0] === '#') {
            target = message.target;
        } else if(message.target !== this.state.nickname) {
            target = 'status';
        } else {
            target = message.source.nick;
        }

        this.addMessageToChannel(target, '', ['<' + message.source.nick + '> ' + message.message]);
    }

    onNick(message) {
        if(!message) {
            return;
        }

        if(message.source.nick === this.state.nickname) {
            this.setState({ nickname: message.newnick });
            this.addMessageToChannel('status', '', 'Nickname changed to ' + message.newnick);
            return;
        }

        var targetChannels = _.filter(this.state.channels, function(channel) {
            return _.any(channel.users, function(user) {
                return user.nick === message.source.nick;
            });
        });

        _.each(targetChannels, channel => {
            var channelKey = channel.key;

            channel.users = _.reject(channel.users, function(user) {
                return user.nick === message.source.nick;
            });

            channel.users.push(message.newnick);

            this.addMessageToChannel(channelKey, '', [message.source.nick + ' is now known as ' + message.newnick]);
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

        this.selectChannel(channel);
        channels[channel].unreadCount = 0;

        this.setState({ channels: channels });
    }

    onCloseChannel(channel) {
        if(!channel) {
            return;
        }

        var channels = this.state.channels;

        delete channels[channel];

        this.selectChannel('status');

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
