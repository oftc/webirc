import React from 'react';
import TestUtils from 'react-addons-test-utils';
import UserList from './../client/UserList.jsx';
import _ from 'underscore';

describe('the <UserList /> component', function() {
    var component;

    describe('when initially rendered', function() {
        it('should render an empty list', function() {
            component = TestUtils.renderIntoDocument(<UserList />);

            var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');

            expect(_.isEmpty(listItems)).toBe(true);
        });
    });

    describe('when users are provided', function() {
        it('should render list items for each user', function() {
            component = TestUtils.renderIntoDocument(
                <UserList users={ ['user1', 'user2'] } />);

            var listItems = TestUtils.scryRenderedDOMComponentsWithTag(component, 'li');

            expect(listItems.length).toBe(2);
            expect(listItems[0].innerText).toBe('user1');
            expect(listItems[1].innerText).toBe('user2');
        });
    });
});
