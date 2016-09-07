import React from 'react';
import TestUtils from 'react-addons-test-utils';
import ChannelList from './../client/ChannelList.jsx';
import _ from 'underscore';

describe('the <ChannelList /> component', function() {
    var component;

    describe('when initially rendered', function() {
        it('should render an empty list', function() {
            component = TestUtils.renderIntoDocument(<ChannelList />);

            var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');

            expect(_.isEmpty(listItems)).toBe(true);
        });
    });

    describe('when channels are provided', function() {
        it('should render list items for each channel', function() {
            component = TestUtils.renderIntoDocument(
                <ChannelList channels={{ 'test1': { key: 'test1', name: 'Test1' }, 'test2': { key: 'test2', name: 'Test2' }}} />);

            var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');

            expect(listItems.length).toBe(2);
            expect(listItems[0].innerText).toBe('Test1');
            expect(listItems[1].innerText).toBe('Test2');
        });
    });

    describe('when a channel is selected', function() {
        it('should mark the selected channel as active', function() {
            component = TestUtils.renderIntoDocument(
                <ChannelList channels={{ 'test1': { key: 'test1', name: 'Test1', selected: true }, 'test2': { key: 'test2', name: 'Test2' }}} />);

            var listItems = TestUtils.scryRenderedDOMComponentsWithClass(component, 'active');

            expect(listItems.length).toBe(1);
            expect(listItems[0].innerText).toBe('Test1');
        });
    });

    describe('when a list item is clicked on', function() {
        describe('and there is no callback defined', function() {
            it('should not try to callback', function() {
                component = TestUtils.renderIntoDocument(
                    <ChannelList channels={{ 'test1': { key: 'test1', name: 'Test1' }, 'test2': { key: 'test2', name: 'Test2' }}} />);

                var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');
                var linkNode = listItems[0].firstChild;

                TestUtils.Simulate.click(linkNode);
            });
        });

        describe('that is already selected', function() {
            it('should not raise a selection event', function() {
                var selectedSpy = { selected: function() { } };

                spyOn(selectedSpy, 'selected');

                component = TestUtils.renderIntoDocument(
                    <ChannelList channels={{ 'test1': { key: 'test1', name: 'Test1', selected: true }, 'test2': { key: 'test2', name: 'Test2' }}}
                                 onSelected={ selectedSpy.selected } />);

                var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');
                var linkNode = listItems[0].firstChild;

                TestUtils.Simulate.click(linkNode);
                expect(selectedSpy.selected).not.toHaveBeenCalled();
            });
        });

        describe('that is not currently selected', function() {
            it('should raise a selection event with the correct channel', function() {
                var selectedSpy = { selected: function() { } };

                spyOn(selectedSpy, 'selected');

                component = TestUtils.renderIntoDocument(
                    <ChannelList channels={{ 'test1': { key: 'test1', name: 'Test1', selected: true }, 'test2': { key: 'test2', name: 'Test2' }}}
                                 onSelected={ selectedSpy.selected } />);

                var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');
                var linkNode = listItems[1].firstChild;

                TestUtils.Simulate.click(linkNode);
                expect(selectedSpy.selected).toHaveBeenCalledWith('test2');
            });
        });
    });
});
