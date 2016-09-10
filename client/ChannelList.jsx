import React from 'react';
import _ from 'underscore';

class ChannelList extends React.Component {
    constructor() {
        super();

        this.onSelected = this.onSelected.bind(this);
        this.onCloseChannel = this.onCloseChannel.bind(this);
    }

    onSelected(channel) {
        if (channel.selected) {
            return;
        }

        if (this.props.onSelected) {
            this.props.onSelected(channel.key);
        }
    }

    onCloseChannel(channel) {
        if(this.props.onCloseChannel) {
            this.props.onCloseChannel(channel);
        }
    }

    render() {
        var channels = [];

        if (!_.isEmpty(this.props.channels)) {
            _.each(this.props.channels, (channel, key) => {
                var badge = null;
                var remove = null;

                if (channel.unreadCount && channel.unreadCount !== 0) {
                    badge = <span className='badge'>{ channel.unreadCount }</span>;
                }

                if (channel.key !== 'status') {
                    remove = (
                        <span className='pull-right'>
                            <span className='close-channel' onClick={ this.onCloseChannel.bind(this, channel.key) }>
                                <i className='remove glyphicon glyphicon-remove-sign text-danger' />
                            </span>
                        </span>);
                }

                channels.push(
                    <li key={ key } className={ channel.selected ? 'active' : '' }>
                        <a href='#' onClick={ () => this.onSelected(channel) }>
                            { channel.name }
                            { badge }
                            { remove }
                        </a>
                    </li>);
            });
        }

        return (
            <div className='channel-list col-xs-1 sidebar'>
                <ul className='nav nav-sidebar'>
                    { channels }
                </ul>
            </div>);
    }
}

ChannelList.displayName = 'ChannelList';
ChannelList.propTypes = {
    channels: React.PropTypes.object,
    onCloseChannel: React.PropTypes.func,
    onSelected: React.PropTypes.func
};

export default ChannelList;
