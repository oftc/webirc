class TextWindow extends React.Component {
    componentDidUpdate() {
        this.updateScroll();
    }

    render() {
        var messages = [];

        var itemIndex = 0;
        this.props.messages.forEach(function(item) {
            var key = item.timestamp + itemIndex.toString();

            messages.push(
                <div key={key}>
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

    updateScroll() {
        $('.text-window').scrollTop(0xffffff);
    }
}

TextWindow.displayName = 'TextWindow';
TextWindow.propTypes = {
    messages: React.PropTypes.array.isRequired
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = TextWindow;
    }
    
    exports.ComandBar = TextWindow;
}