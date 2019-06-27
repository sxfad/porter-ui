/**
 * 给输入框添加清空按钮 suffix ，点击可清空Input，并使Input获得焦点
 * @example
 * import InputClear from 'path/to/InputClear';
 *
 * // form必传
 * <InputClear
 *   form={form}
 *   prefix={<Icon type="user" style={{fontSize: 13}}/>}
 *   placeholder="Username"
 * />
 *
 * @module 扩展antd.Input加清空按钮
 */

import React, {Component} from 'react';
import {Input, Icon} from 'antd';
import PropTypes from 'prop-types';

const closeIconColor = 'rgba(0, 0, 0, 0.25)';
const closeIconHoverColor = 'rgba(0, 0, 0, 0.43)';

export default class InputClear extends Component {

    static propTypes = {
        form: PropTypes.object.isRequired,
    }

    state = {
        iconColor: closeIconColor,
        showCloseIcon: false,
    }

    showCloseIcon() {
        const {value} = this.props;
        if (value) this.setState({showCloseIcon: true});
    }

    hideCloseIcon() {
        this.setState({showCloseIcon: false});
    }

    render() {
        const {iconColor, showCloseIcon} = this.state;
        const {id, form} = this.props;

        let injectProps = {};
        injectProps.suffix = (
            <Icon
                style={{
                    transition: 'color 0.3s ease, opacity 0.15s ease',
                    color: iconColor,
                    cursor: 'pointer',
                    opacity: showCloseIcon ? 1 : 0,
                }}
                type="close-circle"
                onMouseEnter={() => {
                    this.showCloseIcon();
                    this.setState({iconColor: closeIconHoverColor});
                }}
                onMouseLeave={() => this.setState({iconColor: closeIconColor})}
                onClick={() => {
                    if (form && id) {
                        form.setFieldsValue({[id]: undefined});
                        this.__input.focus();
                    }
                }}
            />
        );
        return (
            <Input
                {...injectProps}
                {...this.props}
                ref={node => this.__input = node}
                onMouseEnter={() => this.showCloseIcon()}
                onMouseLeave={() => this.hideCloseIcon()}
            />
        );
    }
}
