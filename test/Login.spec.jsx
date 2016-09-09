import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Login from './../client/Login.jsx';

describe('the <Login /> component', function() {
    var component;

    describe('when initially rendered', function() {
        it('should render a form component with blank nickname', function() {
            component = TestUtils.renderIntoDocument(<Login />);

            var form = TestUtils.scryRenderedDOMComponentsWithTag(component, 'form');

            expect(form.length).toBe(1);
            expect(component.state.nickname).toBe('');
        });
    });

    describe('when the nickname field is changed', function () {
        it('should set the nickname state', function() {
            component = TestUtils.renderIntoDocument(<Login />);

            var input = TestUtils.findRenderedDOMComponentWithTag(component, 'input');
            input.value = 'Test';

            TestUtils.Simulate.change(input);

            expect(component.state.nickname).toBe('Test');
        });
    });

    describe('when the connect button is clicked', function() {
        it('should call the state changed callback with the nickname as a parameter', function () {
            var spy = { onStateChanged: function() { } };

            spyOn(spy, 'onStateChanged');

            component = TestUtils.renderIntoDocument(<Login onStateChanged={ spy.onStateChanged } />);

            var input = TestUtils.findRenderedDOMComponentWithTag(component, 'input');
            input.value = 'Test';
            var button = TestUtils.findRenderedDOMComponentWithTag(component, 'button');

            TestUtils.Simulate.change(input);
            TestUtils.Simulate.click(button);

            expect(spy.onStateChanged).toHaveBeenCalledWith('irc', 'Test');
        });
    });
});
