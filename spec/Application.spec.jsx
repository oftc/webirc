/*global React, Application */

var IRCStream = require('ircng');

describe('the Application component', function() {
    var component;
    var socketMock = { on: function() { } };

    beforeEach(function() {
        spyOn(io, 'connect').and.returnValue(socketMock);
        spyOn(IRCStream.prototype, 'on');
    });

    describe('on first render', function() {
        it('should render a main window with the status channel defined', function() {
            component = TestUtils.renderIntoDocument(<Application />);

            expect(component.state.channels.length).toBe(1);
            expect(component.state.channels[0].name).toBe('Status');

            expect(IRCStream.prototype.on).toHaveBeenCalled();
        });
    });

    describe('onMessage', function() {
        document.stubComponent(MainWindow);

        describe('when no message passed in', function() {
            it('no messages are added to the state', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage();

                expect(component.state.messages.length).toBe(0);
            });
        });

        describe('when message passed in but no command in it', function() {
            it('no messages are added to the state', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage({});

                expect(component.state.messages.length).toBe(0);
            });
        });

        describe('when message passed in with command but no args', function() {
            it('the message is added to the state', function() {
                component = TestUtils.renderIntoDocument(<Application />);

                component.onMessage({ command: 'TEST' });

                expect(component.state.messages.length).toBe(1);
                expect(component.state.messages[0].command).toBe('TEST');
                expect(component.state.messages[0].args.length).toBe(0);
                expect(component.state.messages[0].timestamp).not.toBe('');
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
