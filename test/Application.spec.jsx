import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Application from './../client/Application.jsx'
import MainWindow from './../client/MainWindow.jsx';
import ChannelList from './../client/ChannelList.jsx';
import stubComponent from './test-setup.js';
import IRCStream from 'ircng';
import io from 'socket.io-client'
import _ from 'underscore';

describe('the Application component', function () {
    var component;
    var socketMock = { on: function () { } };

    stubComponent(MainWindow);
    stubComponent(ChannelList);

    beforeEach(function () {
        spyOn(io, 'connect').and.returnValue(socketMock);
        spyOn(IRCStream.prototype, 'on');
    });

    describe('on first render', function () {
        it('should render a main window with the status channel defined', function () {
            component = TestUtils.renderIntoDocument(<Application />);

            expect(component.state.channels.status).not.toBe(undefined);

            expect(IRCStream.prototype.on).toHaveBeenCalled();
        });
    });

    describe('onMessage', function () {
        describe('when no message passed in', function () {
            it('should add no messages to the state', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage();

                expect(component.state.channels.status.messages.length).toBe(0);
            });
        });

        describe('when message passed in but no command in it', function () {
            it('should add no messages to the state', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage({});

                expect(component.state.channels.status.messages.length).toBe(0);
            });
        });

        describe('when message is passed in with no target', function () {
            it('should add the message to the status message list', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage({ command: 'TEST' });

                expect(component.state.channels.status.messages.length).toBe(1);
                expect(component.state.channels.status.messages[0].command).toBe('TEST');
                expect(component.state.channels.status.messages[0].args.length).toBe(0);
                expect(component.state.channels.status.messages[0].timestamp).not.toBe('');
            });
        });

        describe('when message is passed in with target', function () {
            it('should add the message to the message list for the target', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage({ command: 'TEST', target: '#test' });

                expect(component.state.channels['#test'].messages.length).toBe(1);
                expect(component.state.channels['#test'].messages[0].command).toBe('TEST');
                expect(component.state.channels['#test'].messages[0].args.length).toBe(0);
                expect(component.state.channels['#test'].messages[0].timestamp).not.toBe('');
            });
        });
    });

    describe('processCommand', function () {
        describe('when command is undefined', function () {
            it('should process no commands and return false', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                var ret = component.processCommand();

                expect(ret).toBe(false);
            });
        });

        describe('that is unrecognised', function () {
            it('should return false', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                var ret = component.processCommand('NOTACOMMAND');

                expect(ret).toBe(false);
            });
        });

        describe('that is JOIN', function () {
            describe('with no parameters', function () {
                it('should return false', function () {
                    spyOn(IRCStream.prototype, 'joinChannel');
                    component = TestUtils.renderIntoDocument(<Application />);

                    var ret = component.processCommand('JOIN');

                    expect(ret).toBe(false);
                    expect(IRCStream.prototype.joinChannel).not.toHaveBeenCalled();
                });
            });

            describe('with a parameter', function () {
                it('should join the requested channel', function () {
                    spyOn(IRCStream.prototype, 'joinChannel');
                    component = TestUtils.renderIntoDocument(<Application />);

                    var ret = component.processCommand('JOIN #test');

                    expect(ret).toBe(true);
                    expect(IRCStream.prototype.joinChannel).toHaveBeenCalled();
                })
            })
        });

        describe('that is PART', function () {
            describe('with no paramters and in the status window', function () {
                it('should return false', function () {
                    spyOn(IRCStream.prototype, 'leaveChannel');
                    component = TestUtils.renderIntoDocument(<Application />);

                    var ret = component.processCommand('PART');

                    expect(ret).toBe(false);
                    expect(IRCStream.prototype.leaveChannel).not.toHaveBeenCalled();
                });
            });

            describe('with no parameters and with a channel selected', function () {
                it('should leave the currently selected channel', function () {
                    spyOn(IRCStream.prototype, 'leaveChannel');
                    component = TestUtils.renderIntoDocument(<Application />);

                    component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });

                    var ret = component.processCommand('PART');

                    expect(ret).toBe(true);
                    expect(IRCStream.prototype.leaveChannel).toHaveBeenCalledWith('#test');
                });
            });

            describe('with a parameter not matching any joined channels', function () {
                it('should return false', function () {
                    spyOn(IRCStream.prototype, 'leaveChannel');
                    component = TestUtils.renderIntoDocument(<Application />);

                    var ret = component.processCommand('PART #test');

                    expect(ret).toBe(false);
                    expect(IRCStream.prototype.leaveChannel).not.toHaveBeenCalled();
                });
            });

            describe('with a parameter matching a joined channel', function () {
                it('should leave the targetted channel', function () {
                    spyOn(IRCStream.prototype, 'leaveChannel');
                    component = TestUtils.renderIntoDocument(<Application />);

                    component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                    component.onJoin({ source: 'WebIRC!user@host', channel: '#test2' });

                    var ret = component.processCommand('PART #test');

                    expect(ret).toBe(true);
                    expect(IRCStream.prototype.leaveChannel).toHaveBeenCalledWith('#test');
                });
            });

            describe('with a parameter matching a joined channel with the wrong case', function () {
                it('should leave the targetted channel', function () {
                    spyOn(IRCStream.prototype, 'leaveChannel');
                    component = TestUtils.renderIntoDocument(<Application />);

                    component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                    component.onJoin({ source: 'WebIRC!user@host', channel: '#test2' });

                    var ret = component.processCommand('PART #TeSt');

                    expect(ret).toBe(true);
                    expect(IRCStream.prototype.leaveChannel).toHaveBeenCalledWith('#test');
                });
            });
        });
    });

    describe('joinMessage', function () {
        describe('when new channel joined by me', function () {
            it('should add the new channel to the state', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });

                expect(component.state.channels['#test']).not.toBe(undefined);
                expect(component.state.channels['#test'].name).toBe('#test');
            });

            it('should deselect other channels and select the newly joined channel', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });

                expect(component.state.channels['#test'].selected).toBe(true);
                expect(component.state.channels.status.selected).toBe(false);
            });
        });

        describe('when channel is joined by someone else', function () {
            it('should add the user to the channel and add a join message', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onJoin({ source: 'test!user@host', channel: '#test' });

                expect(component.state.channels['#test'].users.length).toBe(1);
                expect(component.state.channels['#test'].messages.length).toBe(1);
            });
        });
    });

    describe('onChannelSelected', function () {
        describe('when channel not selected', function () {
            it('should set the channel to be selected', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: 'test' });
                component.onJoin({ source: 'WebIRC!user@host', channel: 'test2' });

                component.onChannelSelected('test');

                expect(component.state.channels['test'].selected).toBe(true);
                expect(component.state.channels['test2'].selected).toBe(false);
            });
        });

        describe('when new channel selected', function () {
            it('should set the new channel selected and all others unselected', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: 'test' });
                component.onJoin({ source: 'WebIRC!user@host', channel: 'test2' });

                component.onChannelSelected('test');
                component.onChannelSelected('test2');

                expect(component.state.channels['test'].selected).not.toBe(true);
                expect(component.state.channels['test2'].selected).toBe(true);
            });
        });
    });

    describe('onCommand', function () {
        describe('when the parameter does not start with a slash', function () {
            it('should not process any messages', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                spyOn(component, 'processCommand');

                component.onCommand('NOSLASH');

                expect(component.processCommand).not.toHaveBeenCalled();
            });
        });

        describe('when the parameter starts with a slash', function () {
            it('should process the messages', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                spyOn(component, 'processCommand');

                component.onCommand('/COMMAND');

                expect(component.processCommand).toHaveBeenCalled();
            });
        });
    });

    describe('onPrivmsg', function () {
        describe('when no message passed in', function () {
            it('should add no messages to the state', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onPrivmsg();

                expect(component.state.channels.status.messages.length).toBe(0);
            });
        });

        describe('when privmsg not to me or to a channel', function () {
            it('should add the message to the status channel', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onPrivmsg({ source: 'test!user@host', target: 'notyou', message: 'testing testing' });

                expect(component.state.channels.status.messages.length).toBe(1);
            });
        });

        describe('when privmsg to a channel that we have joined', function () {
            it('should add the message to the channel\'s messages', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });

                component.onPrivmsg({ source: 'test!user@host', target: '#test', message: 'testing testing' });

                expect(component.state.channels['#test'].messages.length).toBe(1);
            });
        });

        describe('when privmsg to a channel we have not joined', function () {
            it('should create the channel and add the message to it', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onPrivmsg({ source: 'test!user@host', target: '#test', message: 'testing testing' });

                expect(component.state.channels['#test'].messages.length).toBe(1);
            });
        });

        describe('when privmsg to me and not channel from new source', function () {
            it('should add new channel for that source with the message', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onPrivmsg({ source: 'test!user@host', target: 'WebIRC', message: 'testing testing' });

                expect(component.state.channels['test'].messages.length).toBe(1);
            });
        });
    });

    describe('on353Numeric', function () {
        describe('when called with no message', function () {
            it('should not change any channel user list', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.on353Numeric();

                expect(_.every(component.state.channels, function (channel) {
                    return channel.users.length === 0;
                })).toBe(true);
            });
        });

        describe('when called for a joined channel', function () {
            it('should add the users to the channel user list', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.on353Numeric({ numeric: '353', args: ['WebIRC', '=', '#test', 'nick1 nick2 nick3'] });

                expect(component.state.channels['#test'].users.length).toBe(3);
            });
        });
    });

    describe('onPart', function () {
        describe('when called with no message', function () {
            it('should not change any channel', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onPart();

                expect(component.state.channels['#test']).not.toBe(undefined);
            });
        });

        describe('when called with a channel we are on and us as source', function () {
            it('should remove the channel from the list', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onPart({ source: 'WebIRC!user@host', channel: '#test', message: 'Testing' });

                expect(component.state.channels['#test']).toBe(undefined);
            });

            it('should set the selected channel to the status window', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onPart({ source: 'WebIRC!user@host', channel: '#test', message: 'Testing' });

                expect(component.state.channels.status.selected).toBe(true);
            });
        });

        describe('when called with a channel we are on and not us as source', function () {
            it('should remove the user from the channel list and adds a part message', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onJoin({ source: 'test1!user@host', channel: '#test' });
                component.onPart({ source: 'test1!user@host', channel: '#test', message: 'Testing' });

                expect(component.state.channels['#test'].users.length).toBe(0);
                expect(component.state.channels['#test'].messages.length).toBe(2);
            });
        });
    });

    describe('onQuit', function () {
        describe('when called with no message', function () {
            it('should not change any channels or state', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onJoin({ source: 'test!user@host', channel: '#test' });

                component.onQuit();

                expect(component.state.channels['#test']).not.toBe(undefined);
                expect(component.state.channels['#test'].users.length).toBe(1);
            });
        });

        describe('when called for a user we know nothing about', function () {
            it('should not change any channels or state', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onJoin({ source: 'test!user@host', channel: '#test' });
                component.onQuit({ source: 'unknown!user@host' });

                expect(component.state.channels['#test']).not.toBe(undefined);
                expect(component.state.channels['#test'].users.length).toBe(1);
            });
        });

        describe('when called for a user on a channel we are on', function () {
            it('should remove that user from the channel and display a message in that channel', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onJoin({ source: 'test!user@host', channel: '#test' });
                component.onQuit({ source: 'test!user@host', message: 'quit' });

                expect(component.state.channels['#test']).not.toBe(undefined);
                expect(component.state.channels['#test'].users.length).toBe(0);
                expect(component.state.channels['#test'].messages.length).toBe(2);
            });
        });

        describe('when called for a user on multiple channels we are on', function () {
            it('should remove that user from all of the channels and display a message in those channels', function () {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ source: 'WebIRC!user@host', channel: '#test' });
                component.onJoin({ source: 'WebIRC!user@host', channel: '#test2' });
                component.onJoin({ source: 'test!user@host', channel: '#test' });
                component.onJoin({ source: 'test!user@host', channel: '#test2' });
                component.onQuit({ source: 'test!user@host', message: 'quit' });

                expect(component.state.channels['#test']).not.toBe(undefined);
                expect(component.state.channels['#test'].users.length).toBe(0);
                expect(component.state.channels['#test'].messages.length).toBe(2);
                expect(component.state.channels['#test2'].users.length).toBe(0);
                expect(component.state.channels['#test2'].messages.length).toBe(2);                
            });
        });        
    });
});
