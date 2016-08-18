require('./dom-mock')('<html><body></body></html>');

var jsdom = require('mocha-jsdom');
var React = require('react');
var TestUtils = require('react-addons-test-utils');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var TextWindow = require('../client/TextWindow');

describe('The TextWindow component', function() {
    describe('on first render and no messages', function() {
        it('should render no messages', function() {
            const renderer = TestUtils.createRenderer();
            renderer.render(<TextWindow messages={[]} />);
            const output = renderer.getRenderOutput();

            expect(output.type).to.equals('div');
            const childProps = React.Children.toArray(output.props.children);
            expect(childProps).to.be.empty;
        });
    });

    describe('on first render and some messages', function() {
        it('should render messages', function() {
            const renderer = TestUtils.createRenderer();
            renderer.render(<TextWindow messages={[{ timestamp: '', command: '', args: [] }]} />);
            const output = renderer.getRenderOutput();

            expect(output.type).to.equals('div');
            const childProps = React.Children.toArray(output.props.children);
            expect(childProps).to.not.be.empty;
        });
    });

    describe('when messages are added', function() {
        it('should render the new messages', function() {
            const renderer = TestUtils.createRenderer();
            var messages = [];
            renderer.render(<TextWindow messages={ messages } />);
            var output = renderer.getRenderOutput();

            messages.push({ timestamp: '', command: '', args: [] });

            renderer.render(<TextWindow messages={ messages } />);
            output = renderer.getRenderOutput();

            const childProps = React.Children.toArray(output.props.children);
            expect(childProps).to.not.be.empty;
        });
    });
});
