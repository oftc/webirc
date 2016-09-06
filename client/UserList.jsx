import React from 'react';
import _ from 'underscore';

class UserList extends React.Component {
    constructor() {
        super();
    }

    render() {
        var users = [];

        _.each(this.props.users, function (user) {
            users.push(<li key={ user }>{ user }</li>)
        });

        return (
            <div className='col-md-2 pull-right'>
                <ul>
                    { users }
                </ul>
            </div>);
    }
}

UserList.displayName = 'UserList';
UserList.propTypes = {
    users: React.PropTypes.array,
};

export default UserList;
