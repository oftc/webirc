/*global React, ChannelList, TextWindow, CommandBar */

class MainWindow extends React.Component {
    constructor() {
        super();
    }

    render() {
        var textWindows = [];
        var channels = [];

        for(var channelKey in this.props.channels) {
            textWindows.push(<TextWindow key={ channelKey } messages={ this.props.channels[channelKey].messages || [] } />);
            channels.push({ name: this.props.channels[channelKey].name });
        }
        
        return (
            <div>
                <ChannelList channels={ channels } />
                { textWindows }
                <footer className='footer'>
                    <CommandBar onCommand={ this.props.onCommand }/>
                </footer>
            </div>);
    }
}

MainWindow.displayName = 'MainWindow';
MainWindow.propTypes = {
    channels: React.PropTypes.object.isRequired,
    onCommand: React.PropTypes.func
};
