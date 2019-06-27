import React from 'react';
import './style.less';

export default class PageContent extends React.Component {
    static defaultProps = {
        className: '',
    }

    render() {
        const className = this.props.className;
        const classNames = `page-content ${className}`;
        return (
            <div {...this.props} className={classNames}>
                {this.props.children}
            </div>
        );
    }
}
