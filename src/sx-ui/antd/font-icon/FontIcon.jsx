import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'antd';
import './font-awesome/css/font-awesome.css';
/**
 * 文字图标，支持fa 和 antd 自带图标
 */
export default class FontIcon extends Component {
    static defaultProps = {
        size: '', // lg 2x 3x 4x 5x
        className: 'font-icon',
    }
    static propsType = {
        type: PropTypes.string.isRequired,
        className: PropTypes.string,
    }

    render() {
        const {type = '', className, size, style = {}} = this.props;
        let classStr = '';
        const sizeStr = size ? `fa-${size}` : '';
        if (type && type.startsWith('fa-')) {
            classStr = `font-icon ${className} fa ${type} ${sizeStr}`;
            return <i {...this.props} className={classStr} style={style}/>;
        }
        // 如果要支持其他库，这里继续扩展

        // 没检测到任何前缀，返回antd默认的图标
        return <Icon {...this.props} type={type} className={`font-icon ${className} ${sizeStr}`} style={style}/>;
    }
}
