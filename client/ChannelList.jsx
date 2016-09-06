import React from 'react';
import _ from 'underscore';

class ChannelList extends React.Component {
    constructor() {
        super();

        this.onSelected = this.onSelected.bind(this);
    }

    onSelected(channel) {
        if(channel.selected) {
            return;
        }

        if(this.props.onSelected) {
            this.props.onSelected(channel.key);
        }    
    }

    render() {
        var channels = [];

        if(!_.isEmpty(this.props.channels)) {
            _.each(this.props.channels, (channel, key) => {
                channels.push(
                    <li key={ key } className={ channel.selected ? 'active' : '' }>
                        <a href='#' onClick={ () => this.onSelected(channel) }>{ channel.name }</a>
                    </li>);
            });
        }

        return (
            <div className='channel-list col-md-2 sidebar'>
                <ul className='nav nav-sidebar'>
                    { channels }
                </ul>
            </div>);
    }
}

ChannelList.displayName = 'ChannelList';
ChannelList.propTypes = {
    channels: React.PropTypes.object,
    onSelected: React.PropTypes.func
};

export default ChannelList;
