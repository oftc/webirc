/*global React */

class ChannelList extends React.Component {
    render() {
        var channels = [];

        this.props.channels.forEach(function(channel) {
            var className = channel.selected ? 'active' : '';

            channels.push(<li key={ channel.name } className='{ className }'><a href='#'>{ channel.name }</a></li>);
        });

        return(
            <div className='channel-list col-md-2 sidebar'>
                <ul className='nav nav-sidebar'>
                    { channels }
                </ul>
            </div>);
    }
}

ChannelList.displayName = 'ChannelList';
ChannelList.propTypes = {
    channels: React.PropTypes.array
};
