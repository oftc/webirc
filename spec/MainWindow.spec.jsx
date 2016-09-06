/*global React, MainWindow */

var TestUtils = React.addons.TestUtils;

describe('the <MainWindow /> component', function() {
    var component;

    document.stubComponent(ChannelList);
    document.stubComponent(TextWindow);

    describe('when initially rendered', function() {
        it('should render a channel list, and a footer', function() {
            component = TestUtils.renderIntoDocument(<MainWindow channels={ { } } />);

            var channelList = TestUtils.scryRenderedComponentsWithType(component, ChannelList);
            var footer = TestUtils.scryRenderedDOMComponentsWithTag(component, 'footer');

            expect(channelList.length).toBe(1);
            expect(footer.length).toBe(1);
        });
    });

    describe('when rendered with channels', function() {
        it('should render the text window for the selected channel', function() {
            var messages = ['1', '2'];
            component = TestUtils.renderIntoDocument(
                <MainWindow channels={ { status: { name: 'Status', messages: [] }, test: { name: 'Test', selected: true, messages: messages } } } />);

            var textWindows = TestUtils.scryRenderedComponentsWithType(component, TextWindow);
            
            expect(textWindows[0].props.messages).toBe(messages);
        });
    });
});