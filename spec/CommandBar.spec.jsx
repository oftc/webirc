/*global React, CommandBar */

var TestUtils = React.addons.TestUtils;

describe('The CommandBar Component', function() {
    var component;

    describe('on first render', function() {
        it('should render a blank input control', function() {
            component = TestUtils.renderIntoDocument(<CommandBar />);

            var childComponent = TestUtils.findRenderedDOMComponentWithTag(component, 'input');

            expect(childComponent.value).toBe('');
        });
    });

    describe('when the input is changed', function() {
        it('should set the command value when the input is changed', function() {
            component = TestUtils.renderIntoDocument(<CommandBar />);

            var input = TestUtils.findRenderedDOMComponentWithTag(component, 'input');
            input.value = 'test';
            TestUtils.Simulate.change(input);

            expect(component.state.command).toBe('test');
        });
    });

    describe('when a key is pressed', function() {
        describe('that is not enter', function() {
            it('should not raise a command event', function() {
                var spy = {
                    onCommand: function() {
                    }
                };

                spyOn(spy, 'onCommand');
                component = TestUtils.renderIntoDocument(<CommandBar onCommand={ spy.onCommand }/>);
                var input = TestUtils.findRenderedDOMComponentWithTag(component, 'input');

                TestUtils.Simulate.keyPress(input, { key: 'A', keyCode: 65, which: 65 });

                expect(spy.onCommand).not.toHaveBeenCalled();
            });
        });

        describe('that is enter', function() {
            it('should raise a command event', function() {
                var spy = {
                    onCommand: function() {
                    }
                };

                spyOn(spy, 'onCommand');
                component = TestUtils.renderIntoDocument(<CommandBar onCommand={ spy.onCommand }/>);
                var input = TestUtils.findRenderedDOMComponentWithTag(component, 'input');

                TestUtils.Simulate.keyPress(input, { key: 'Enter', keyCode: 13, which: 13 });

                expect(spy.onCommand).toHaveBeenCalled();
            });
        });

        describe('that is enter and there is a command value set', function() {
            it('should raise a command event with the current command value', function() {
                var spy = {
                    onCommand: function() {
                    }
                };

                spyOn(spy, 'onCommand');
                component = TestUtils.renderIntoDocument(<CommandBar onCommand={ spy.onCommand }/>);
                var input = TestUtils.findRenderedDOMComponentWithTag(component, 'input');
                input.value = 'test';
                TestUtils.Simulate.change(input);

                TestUtils.Simulate.keyPress(input, { key: 'Enter', keyCode: 13, which: 13 });

                expect(spy.onCommand).toHaveBeenCalledWith('test');
            });
        });
    });
});
