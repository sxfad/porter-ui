import React from 'react';
import './style.less';

export default class ToolBar extends React.Component {
    static defaultProps = {
        className: '',
    }

    render() {
        const className = this.props.className;
        const classNames = `tool-bar ${className}`;
        return (
            <div {...this.props} className={classNames}>
                {this.props.children}
            </div>
        );
    }
}
