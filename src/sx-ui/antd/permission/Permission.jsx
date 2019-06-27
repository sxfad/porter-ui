import React, {Component, PropTypes} from 'react';

export default class Permission extends Component {
    static defaultProps = {};
    static propTypes = {
        code: PropTypes.string.isRequired,
        hasPermission: PropTypes.func.isRequired,
    };

    render() {
        const {code, hasPermission} = this.props;
        if (hasPermission(code)) {
            const props = {...this.props};
            Reflect.deleteProperty(props, 'code');
            Reflect.deleteProperty(props, 'hasPermission');
            return (
                <span {...props}>
                    {this.props.children}
                </span>
            );
        }
        return null;
    }
}
