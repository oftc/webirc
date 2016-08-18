'use strict';

require('./dom-mock')('<html><body></body></html>');

var jsdom = require('mocha-jsdom');
var React = require('react');
var TestUtils = require('react-addons-test-utils');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var CommandBar = require('../client/CommandBar.jsx');

describe('The CommandBar Component', function() {
    describe('on first render', function() {
        it('should render a blank input control', function() {
            const renderer = TestUtils.createRenderer();
            renderer.render(<CommandBar />);
            const output = renderer.getRenderOutput();

            expect(output.type).to.equals('div');
            const props = React.Children.toArray(output.props.children);
            expect(props[0].type).to.equals('input');
            expect(props[0].props.value).to.equals('');
        });
    });
    
    describe('when the input is changed', function() {
        it('should set the command value when the input is changed', function() {
            const renderer = TestUtils.createRenderer();
            renderer.render(<CommandBar />);
            var output = renderer.getRenderOutput();
            var props = React.Children.toArray(output.props.children);

            props[0].props.onChange({ target: { value: 'test' } });
            output = renderer.getRenderOutput();
            props = React.Children.toArray(output.props.children);

            expect(props[0].props.value).to.equals('test');
        });
    });

    describe('when a key is pressed', function() {
        describe('that is not enter', function() {
            it('should not raise a command event', function() {
                var spy = sinon.spy();
                const renderer = TestUtils.createRenderer();
                
                renderer.render(<CommandBar onCommand={ spy }/>);
                var output = renderer.getRenderOutput();
                var props = React.Children.toArray(output.props.children);

                props[0].props.onKeyPress({ key: 'n' });
                output = renderer.getRenderOutput();

                sinon.assert.notCalled(spy);
            });
        });

        describe('that is enter', function() {
            it('should raise a command event', function() {
                var spy = sinon.spy();
                const renderer = TestUtils.createRenderer();
                
                renderer.render(<CommandBar onCommand={ spy }/>);
                var output = renderer.getRenderOutput();
                var props = React.Children.toArray(output.props.children);

                props[0].props.onKeyPress({ key: 'Enter' });
                output = renderer.getRenderOutput();

                sinon.assert.calledOnce(spy);
            });
        });

        describe('that is enter and there is a command value set', function() {
            it('should raise a command event with the current command value', function() {
                var spy = sinon.spy();
                const renderer = TestUtils.createRenderer();
                
                renderer.render(<CommandBar onCommand={ spy }/>);
                var output = renderer.getRenderOutput();
                var props = React.Children.toArray(output.props.children);

                props[0].props.onChange({ target: { value: 'test' } });
                output = renderer.getRenderOutput();
                props[0].props.onKeyPress({ key: 'Enter' });

                sinon.assert.calledOnce(spy);
                expect(spy.getCall(0).args[0]).to.equals('test');
            });
        });
    });
});