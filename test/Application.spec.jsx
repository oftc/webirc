/*global describe, it, expect, beforeEach */
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import Application from './../client/Application.jsx';
import Login from './../client/Login.jsx';
import Irc from './../client/Irc.jsx';
import stubComponent from './test-setup.js';

describe('the <Application /> component', function() {
    var node, component;

    stubComponent(Login);
    stubComponent(Irc);

    beforeEach(function() {
        node = document.createElement('div');
        component = ReactDOM.render(<Application />, node);
    });


    describe('when initially rendered', function() {
        it('should render the login component', function() {
            var childComponent = TestUtils.findRenderedComponentWithType(component, Login);

            expect(childComponent).not.toBe(undefined);
        });
    });

    describe('onStateChanged', function() {
        describe('when the state is changed to irc', function() {
            it('should render the Irc component', function () {
                component.onStateChanged('irc');

                component = ReactDOM.render(<Application />, node);

                var login = TestUtils.scryRenderedComponentsWithType(component, Login);
                var irc = TestUtils.scryRenderedComponentsWithType(component, Irc);

                expect(login.length).toBe(0);
                expect(irc.length).toBe(1);
            });
        });
    });
});
