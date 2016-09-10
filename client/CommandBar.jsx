import React from 'react';

class CommandBar extends React.Component {
    constructor() {
        super();

        this.onKeyPress = this.onKeyPress.bind(this);
        this.onChange = this.onChange.bind(this);
        this.state = {
            command: ''
        };
    }

    onKeyPress(event) {
        if (event.key === 'Enter') {
            this.props.onCommand(this.state.command);
            this.setState({ command: '' });
        }
    }

    onChange(event) {
        this.setState({ command: event.target.value });
    }

    render() {
        return (
            <div className='col-xs-offset-1 col-xs-10 command-bar'>
                <input ref='CommandBarInput' className='command-bar' type='text' onKeyPress={ this.onKeyPress } onChange={ this.onChange } value={ this.state.command } />
            </div>);
    }
}

CommandBar.displayName = 'CommandBar';
CommandBar.propTypes = {
    onCommand: React.PropTypes.func
};

export default CommandBar;
