import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon, Popconfirm} from 'antd';

export default class Operator extends Component {
    static defaultProps = {
        items: [],
        hasPermission(/* permissionCode */) {
            return true;
        },
    }
    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.shape({
            onClick: PropTypes.func,
            label: PropTypes.isRequired,
            permission: PropTypes.string,
            loading: PropTypes.bool,
            confirm: PropTypes.object,
        })),
        hasPermission: PropTypes.func,
    };

    loadingIcon = <Icon type="loading"/>;

    label = {};

    render() {
        const {items, hasPermission} = this.props;
        let operators = [];

        items.forEach((opt, i) => {
            const permission = opt.permission;
            const loading = opt.loading;
            const onClick = opt.onClick;
            let label = opt.label;
            const confirm = opt.confirm;
            let hasPer = true;

            if (loading) {
                const labelWidth = this.label[i].offsetWidth;
                label = <span style={{display: 'inline-block', width: labelWidth, textAlign: 'center'}}>{this.loadingIcon}</span>;
            } else {
                label = <span ref={v => this.label[i] = v}>{label}</span>;
            }

            if (permission) {
                hasPer = hasPermission(permission);
            }

            if (hasPer) {
                if (confirm) {
                    operators.push(
                        <Popconfirm {...confirm}>
                            <a>{label}</a>
                        </Popconfirm>
                    );
                } else {
                    operators.push(<a onClick={onClick}>{label}</a>);
                }
            }
        });

        const operatorsLength = operators.length;

        if (!operatorsLength) {
            return <span>无操作权限</span>;
        }

        return (
            <span>
                {operators.map((v, i) => {
                    return (
                        <span key={`operator-${i}`}>
                            {v}
                            {operatorsLength === i + 1 ? '' : <span className="ant-divider"/>}
                        </span>
                    );
                })}
            </span>
        );
    }
}
