import React from 'react';
import TestUtils from 'react-addons-test-utils';
import MainWindow from './../client/MainWindow.jsx';
import ChannelList from './../client/ChannelList.jsx';
import TextWindow from './../client/TextWindow.jsx';
import UserList from './../client/UserList.jsx';
import stubComponent from './test-setup.js';

describe('the <MainWindow /> component', function () {
    var component;

    stubComponent(ChannelList);
    stubComponent(TextWindow);
    stubComponent(UserList);

    describe('when initially rendered', function () {
        it('should render a channel list, and a footer', function () {
            component = TestUtils.renderIntoDocument(<MainWindow channels={ {} } />);

            var channelList = TestUtils.scryRenderedComponentsWithType(component, ChannelList);
            var footer = TestUtils.scryRenderedDOMComponentsWithTag(component, 'footer');

            expect(channelList.length).toBe(1);
            expect(footer.length).toBe(1);
        });
    });

    describe('when rendered with channels', function () {
        it('should render the text window for the selected channel', function () {
            var messages = ['1', '2'];
            component = TestUtils.renderIntoDocument(
                <MainWindow channels={ { status: { name: 'Status', messages: [] }, test: { name: 'Test', selected: true, messages: messages } } } />);

            var textWindows = TestUtils.scryRenderedComponentsWithType(component, TextWindow);

            expect(textWindows[0].props.messages).toBe(messages);
        });
    });

    describe('onChannelSelected', function () {
        describe('when no callback', function () {
            it('should not call a callback', function () {
                component = TestUtils.renderIntoDocument(<MainWindow channels={ {} } />);
                var channel = {};

                component.onChannelSelected(channel);
            });
        });

        describe('when callback specified', function () {
            it('should call the callback', function () {
                var spy = {
                    onChannelSelected: function () {
                    }
                };

                spyOn(spy, 'onChannelSelected');

                component = TestUtils.renderIntoDocument(<MainWindow channels={ {} } onChannelSelected={ spy.onChannelSelected } />);
                var channel = {};

                component.onChannelSelected(channel);

                expect(spy.onChannelSelected).toHaveBeenCalled();
            });
        })
    });
});
