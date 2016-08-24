/*global React */

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

        return(
            <div id='text-window' className='text-window col-md-10 col-md-offset-2'>
                { messages }
            </div>);
    }
}

TextWindow.displayName = 'TextWindow';
TextWindow.propTypes = {
    messages: React.PropTypes.array.isRequired
};
