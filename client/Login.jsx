import React from 'react';

class Login extends React.Component {
    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
        this.onClick = this.onClick.bind(this);

        this.state = {
            nickname: ''
        };
    }

    onChange(event) {
        this.setState({ nickname: event.target.value });
    }

    onClick(event) {
        this.props.onStateChanged('irc', this.state.nickname);
        event.preventDefault();

        return false;
    }

    onSubmit(event) {
        event.preventDefault();

        return false;
    }

    render() {
        return (
            <div className='login'>
                <form className='form-horizontal' onSubmit={ this.onSubmit }>
                    <div className='form-group'>
                        <label htmlFor='nickname' className='col-sm-1 control-label'>Nickname</label>
                        <div className='col-sm-2'>
                            <input className='form-control' id='nickname' type='text' onChange={ this.onChange } />
                        </div>
                    </div>
                    <div className='form-group'>
                        <div className='col-sm-offset-1 col-sm-2'>
                            <button className='btn btn-primary' onClick={ this.onClick }>Connect</button>
                        </div>
                    </div>
                </form>
            </div>);
    }
}

Login.displayName = 'Login';
Login.propTypes = {
    onStateChanged: React.PropTypes.func
};

export default Login;
