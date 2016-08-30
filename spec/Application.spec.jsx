/*global React, Application */

var IRCStream = require('ircng');

window.testing = true;

describe('the Application component', function() {
    var component;
    var socketMock = { on: function() { } };

    document.stubComponent(MainWindow);
    document.stubComponent(ChannelList);

    beforeEach(function() {
        spyOn(io, 'connect').and.returnValue(socketMock);
        spyOn(IRCStream.prototype, 'on');
    });

    describe('on first render', function() {
        it('should render a main window with the status channel defined', function() {
            component = TestUtils.renderIntoDocument(<Application />);

            expect(component.state.channels.status).not.toBe(undefined);

            expect(IRCStream.prototype.on).toHaveBeenCalled();
        });
    });

    describe('onMessage', function() {
        describe('when no message passed in', function() {
            it('should add no messages to the state', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage();

                expect(component.state.channels.status.messages.length).toBe(0);
            });
        });

        describe('when message passed in but no command in it', function() {
            it('should add no messages to the state', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage({});

                expect(component.state.channels.status.messages.length).toBe(0);
            });
        });

        describe('when message is passed in with no target', function() {
            it('should add the message to the status message list', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage({ command: 'TEST' });

                expect(component.state.channels.status.messages.length).toBe(1);
                expect(component.state.channels.status.messages[0].command).toBe('TEST');
                expect(component.state.channels.status.messages[0].args.length).toBe(0);
                expect(component.state.channels.status.messages[0].timestamp).not.toBe('');
            });
        });

        describe('when message is passed in with target', function() {
            it('should add the message to the message list for the target', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage({ command: 'TEST', target: '#test' });

                expect(component.state.channels['#test'].messages.length).toBe(1);
                expect(component.state.channels['#test'].messages[0].command).toBe('TEST');
                expect(component.state.channels['#test'].messages[0].args.length).toBe(0);
                expect(component.state.channels['#test'].messages[0].timestamp).not.toBe('');
            });
        });
    });

    describe('processCommand', function() {
        describe('when command is undefined', function() {
            it('should process no commands and return false', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                var ret = component.processCommand();

                expect(ret).toBe(false);
            });
        });

        describe('that is unrecognised', function() {
            it('should return false', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                var ret = component.processCommand('NOTACOMMAND');

                expect(ret).toBe(false);
            });
        });

        describe('that is JOIN', function() {
            describe('with no parameters', function() {
                it('should return false', function() {
                    component = TestUtils.renderIntoDocument(<Application />);

                    var ret = component.processCommand('JOIN');

                    expect(ret).toBe(false);
                });
            });

            describe('with a parameter', function() {
                it('joins the requested channel', function() {
                    spyOn(IRCStream.prototype, 'joinChannel');
                    component = TestUtils.renderIntoDocument(<Application />);

                    var ret = component.processCommand('JOIN #test');

                    expect(ret).toBe(true);
                    expect(IRCStream.prototype.joinChannel).toHaveBeenCalled();
                })
            })
        });
    });

    describe('joinMessage', function() {
        describe('when new channel joined', function() {
            it('should add the new channel to the state', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ channel: '#test' });

                expect(component.state.channels['#test']).not.toBe(undefined);
                expect(component.state.channels['#test'].name).toBe('#test');
            });
        });
    });

    describe('onChannelSelected', function() {
        describe('when channel not selected', function() {
            it('should set the channel to be selected', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ channel: 'test' });
                component.onJoin({ channel: 'test2' });

                component.onChannelSelected('test');

                expect(component.state.channels['test'].selected).toBe(true);
                expect(component.state.channels['test2'].selected).toBe(false);
            });
        });

        describe('when new channel selected', function() {
            it('should set the new channel selected and all others unselected', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onJoin({ channel: 'test' });
                component.onJoin({ channel: 'test2' });

                component.onChannelSelected('test');
                component.onChannelSelected('test2');

                expect(component.state.channels['test'].selected).not.toBe(true);
                expect(component.state.channels['test2'].selected).toBe(true);
            });
        });
    });

    describe('onCommand', function() {
        describe('when the parameter does not start with a slash', function() {
            it('should not process any messages', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                spyOn(component, 'processCommand');

                component.onCommand('NOSLASH');

                expect(component.processCommand).not.toHaveBeenCalled();
            });
        });

        describe('when the parameter starts with a slash', function() {
            it('should process the messages', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                spyOn(component, 'processCommand');

                component.onCommand('/COMMAND');

                expect(component.processCommand).toHaveBeenCalled();
            });
        });
    });
});
