'use strict';

require('./dom-mock')('<html><body></body></html>');

var jsdom = require('mocha-jsdom');
var React = require('react');
var TestUtils = require('react-addons-test-utils');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var TextWindow = require('../client/TextWindow.jsx');

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
            renderer.render(<TextWindow messages={[{timestamp: '', comand: '', args:[]}]} />);
            const output = renderer.getRenderOutput();

            expect(output.type).to.equals('div');
            const childProps = React.Children.toArray(output.props.children);
            expect(childProps).to.not.be.empty;
        });
    });
});