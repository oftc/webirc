import React from 'react';
import ChannelList from './ChannelList.jsx';
import TextWindow from './TextWindow.jsx';
import CommandBar from './CommandBar.jsx';
import UserList from './UserList.jsx';

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
        var users = [];

        for(var channelKey in this.props.channels) {
            var channel = this.props.channels[channelKey];

            if(channel.selected) {
                messages = channel.messages || [];
                users = channel.users || [];
            }            
        }
        
        return (
            <div>
                <ChannelList channels={ this.props.channels } onSelected={ this.onChannelSelected } />
                <TextWindow messages={ messages } />
                <UserList users={ users } />
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

export default MainWindow;
