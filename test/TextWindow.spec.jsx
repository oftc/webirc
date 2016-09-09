import React from 'react';
import ReactDOM from 'react-dom';
import TextWindow from './../client/TextWindow.jsx';
import TestUtils from 'react-addons-test-utils';

describe('The TextWindow component', function() {
    var node, component;
    
    beforeEach(function() {
        node = document.createElement('div');
        component = ReactDOM.render(<TextWindow messages={[]} />, node);
    });

    describe('on first render and no messages', function() {
        it('should render no messages', function() {
            var messages = TestUtils.scryRenderedDOMComponentsWithClass(component, 'message');

            expect(messages.length).toBe(0);
        });
    });

    describe('on first render and some messages', function() {
        it('should render messages', function() {
            component = ReactDOM.render(<TextWindow messages={[{ timestamp: '', command: '', args: [] }]} />, node);

            var messages = TestUtils.scryRenderedDOMComponentsWithClass(component, 'message');

            expect(messages.length).toBe(1);
        });
    });

    describe('when messages are added', function() {
        it('should render the new messages', function() {
            var inputMessages = [];
            
            var messages = TestUtils.scryRenderedDOMComponentsWithClass(component, 'message');
            expect(messages.length).toBe(0);            

            inputMessages.push({ timestamp: '', command: '', args: [] });

            ReactDOM.render(<TextWindow messages={ inputMessages } />, node);

            messages = TestUtils.scryRenderedDOMComponentsWithClass(component, 'message');

            expect(messages.length).toBe(1);            
        });
    });
});
