import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import ChannelList from './../client/ChannelList.jsx';
import _ from 'underscore';

describe('the <ChannelList /> component', function () {
    var component, node;
    var channels;

    beforeEach(function () {
        channels = {
            'status': { key: 'status', name: 'Status', selected: true },
            'test1': { key: 'test1', name: 'Test1', messages: [] },
            'test2': { key: 'test2', name: 'Test2' }
        };

        node = document.createElement('div');
        component = ReactDOM.render(<ChannelList channels={ channels } />, node);
    });

    describe('when initially rendered', function () {
        it('should render an empty list', function () {
            component = ReactDOM.render(<ChannelList />, node);
            var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');

            expect(_.isEmpty(listItems)).toBe(true);
        });
    });

    describe('when channels are provided', function () {
        it('should render list items for each channel', function () {
            var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');

            expect(listItems.length).toBe(3);
            expect(listItems[0].innerText).toBe('Status');
            expect(listItems[1].innerText).toBe('Test1');
        });
    });

    describe('when a channel is selected', function () {
        it('should mark the selected channel as active', function () {
            var listItems = TestUtils.scryRenderedDOMComponentsWithClass(component, 'active');

            expect(listItems.length).toBe(1);
            expect(listItems[0].innerText).toBe('Status');
        });
    });

    describe('when a list item is clicked on', function () {
        describe('and there is no callback defined', function () {
            it('should not try to callback', function () {
                var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');
                var linkNode = listItems[0].firstChild;

                TestUtils.Simulate.click(linkNode);
            });
        });

        describe('that is already selected', function () {
            it('should not raise a selection event', function () {
                var selectedSpy = { selected: function () { } };

                spyOn(selectedSpy, 'selected');

                component = ReactDOM.render(
                    <ChannelList channels={ channels } onSelected={ selectedSpy.selected } />, node);

                var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');
                var linkNode = listItems[0].firstChild;

                TestUtils.Simulate.click(linkNode);
                expect(selectedSpy.selected).not.toHaveBeenCalled();
            });
        });

        describe('that is not currently selected', function () {
            it('should raise a selection event with the correct channel', function () {
                var selectedSpy = { selected: function () { } };

                spyOn(selectedSpy, 'selected');

                component = ReactDOM.render(
                    <ChannelList channels={ channels } onSelected={ selectedSpy.selected } />, node);

                var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');
                var linkNode = listItems[1].firstChild;

                TestUtils.Simulate.click(linkNode);
                expect(selectedSpy.selected).toHaveBeenCalledWith('test1');
            });
        });
    });

    describe('when a channel not currently selected has unread messages', function () {
        it('should show a badge on that channel with the number of unread messages', function () {
            channels.test1.unreadCount = 2;

            component = ReactDOM.render(<ChannelList channels={ channels } />, node);
            var badges = TestUtils.scryRenderedDOMComponentsWithClass(component, 'badge');

            expect(badges.length).toBe(1);
            expect(badges[0].innerText).toBe('2');
        });
    });

    describe('when a remove icon is clicked', function () {
        it('should raise a close channel event with the correct channel', function () {
            var closeSpy = { onCloseChannel: function () { } };

            spyOn(closeSpy, 'onCloseChannel');

            component = ReactDOM.render(<ChannelList channels={ channels } onCloseChannel={ closeSpy.onCloseChannel } />, node);

            var closeButtons = TestUtils.scryRenderedDOMComponentsWithClass(component, 'close-channel');

            TestUtils.Simulate.click(closeButtons[0]);

            expect(closeSpy.onCloseChannel).toHaveBeenCalledWith('test1');
        });
    });
});
