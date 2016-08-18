/*global React, ChannelList, TextWindow, CommandBar */

class MainWindow extends React.Component {
    render() {
        return(
            <div>
                <ChannelList channels={ this.props.channels } />
                <TextWindow messages={ this.props.messages } />
                <footer className='footer'>
                    <CommandBar onCommand={ this.props.onCommand }/>
                </footer>
            </div>);
    }
}

MainWindow.displayName = 'MainWindow';
MainWindow.propTypes = {
    channels: React.PropTypes.array,
    messages: React.PropTypes.array,
    onCommand: React.PropTypes.func
};
