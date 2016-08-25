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
            expect(_.isArray(channelList[0].props.channels)).toBe(true);
        });
    });

    describe('when rendered with channels', function() {
        it('should render one text window for each channel', function() {
            component = TestUtils.renderIntoDocument(<MainWindow channels={ { status: { name: 'Status' }, test: { name: 'Test' } } } />);

            var textWindows = TestUtils.scryRenderedComponentsWithType(component, TextWindow);

            expect(textWindows.length).toBe(2);
        });
    });
});
