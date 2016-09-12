import React from 'react';
import $ from 'jquery';

class TextWindow extends React.Component {
    componentDidUpdate() {
        this.updateScroll();
    }

    updateScroll() {
        $('.text-window').scrollTop(0xffffff);
    }

    render() {
        var messages = [];

        var itemIndex = 0;
        this.props.messages.forEach(function(item) {
            var key = item.timestamp + itemIndex.toString();

            messages.push(
                <div className='message' key={key}>
                    <span>[{ item.timestamp }]</span> <span>{ item.command }</span> <span>{ item.args.join(' ') }</span>
                </div>
            );

            itemIndex++;
        });

        var topic = this.props.channel ? <div className='topic text-center'>{ this.props.channel.topic }</div> : null;

        return(
            <div id='text-window' className='text-window col-xs-10 col-xs-offset-1'>
                { topic }
                { messages }
            </div>);
    }
}

TextWindow.displayName = 'TextWindow';
TextWindow.propTypes = {
    channel: React.PropTypes.object,
    messages: React.PropTypes.array.isRequired
};

export default TextWindow;
