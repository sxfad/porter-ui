import React from 'react';
import './style.less';

export default class QueryBar extends React.Component {
    state = {};

    componentDidMount() {
    }

    render() {
        return (
            <div className="query-bar">
                {this.props.children}
            </div>
        );
    }
}
