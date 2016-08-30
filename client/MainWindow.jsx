/*global React, ChannelList, TextWindow, CommandBar */

class MainWindow extends React.Component {
    constructor() {
        super();

        this.onChannelSelected = this.onChannelSelected.bind(this);

        this.state = { channels: [] };
    }

    componentWillMount() {
        this.setState({ channels: this.props.channels });
    }

    onChannelSelected(channel) {
        if(this.props.onChannelSelected) {
            this.props.onChannelSelected(channel);
        }
    }

    render() {
        var messages = [];

        for(var channelKey in this.props.channels) {
            var channel = this.props.channels[channelKey];

            if(channel.selected) {
                messages = channel.messages || [];
            }            
        }
        
        return (
            <div>
                <ChannelList channels={ this.props.channels } onSelected={ this.onChannelSelected } />
                <TextWindow messages={ messages } />
                <footer className='footer'>
                    <CommandBar onCommand={ this.props.onCommand }/>
                </footer>
            </div>);
    }
}

MainWindow.displayName = 'MainWindow';
MainWindow.propTypes = {
    channels: React.PropTypes.object.isRequired,
    onChannelSelected: React.PropTypes.func,
    onCommand: React.PropTypes.func
};
