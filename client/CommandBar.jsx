'use strict';

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
            <div className='col-md-offset-2'>
                <input ref='CommandBarInput' className='command-bar' type='text' onKeyPress={ this.onKeyPress } onChange={ this.onChange } value={ this.state.command }></input>
            </div>);
    }
}

CommandBar.displayName = 'CommandBar';
CommandBar.propTypes = {
    onCommand: React.PropTypes.func
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = CommandBar;
    }
    
    exports.ComandBar = CommandBar;
}