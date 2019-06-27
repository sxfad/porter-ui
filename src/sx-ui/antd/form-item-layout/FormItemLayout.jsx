/**
 * 基于antd FormItem进行布局，label固定宽度，表单元素自适应
 * 使用了antd的两个class，会依赖FormItem的结构
 *
 * */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Form} from 'antd';

const FormItem = Form.Item;
export default class FormItemLayout extends Component {
    static defaultProps = {
        labelSpaceCount: 5, // label所占空间个数，用于与其他label对齐
        labelFontSize: 12, // label字体大小，最终labelWidth = labelSpaceCount * labelFontSize
    }
    static propTypes = {
        className: PropTypes.string,
        style: PropTypes.object,
        width: PropTypes.number, // label + 元素 宽度，即：FormItem总宽度
        float: PropTypes.bool, // 是否是浮动，如果true，将左浮动
        labelWidth: PropTypes.number, // label宽度，如果设置此值，labelSpaceCount 和 labelFontSize将失效
        labelSpaceCount: PropTypes.number,
        labelFontSize: PropTypes.number,
    }
    state = {}

    componentDidMount() {
        const labelWidth = this.getLabelWidth();
        // 处理校验信息，与具体表单元素对齐
        const antFormItemLabel = this.formItemDom.querySelector('.ant-form-item-label');
        const antFormItemControlWrapper = this.formItemDom.querySelector('.ant-form-item-control-wrapper');
        if (antFormItemLabel) {
            antFormItemLabel.style.width = `${labelWidth}px`;
            antFormItemLabel.style.float = 'left';
        }
        if (antFormItemControlWrapper) {
            antFormItemControlWrapper.style.paddingLeft = `${labelWidth}px`;
        }
    }

    /**
     * 获取 label宽度，labelWidth属性优先
     * 如果没有设置width，最终labelWidth = labelSpaceCount * labelFontSize
     * 默认width = 10 * 12 = 120
     *
     * @returns {Number}
     */
    getLabelWidth() {
        const {labelWidth, labelSpaceCount, labelFontSize} = this.props;
        if (labelWidth) return labelWidth;
        return (labelSpaceCount + 2) * labelFontSize;
    }

    render() {
        const {
            id,
            className,
            style,
            width,
            float,
            children,
        } = this.props;

        const wrapperProps = {};
        if (id) wrapperProps.id = id;
        if (className) wrapperProps.className = className;
        if (style) wrapperProps.style = style;
        if (!wrapperProps.style) wrapperProps.style = {};
        if (width && !wrapperProps.style.width) wrapperProps.style.width = width;
        if (float && !wrapperProps.style.float) wrapperProps.style.float = 'left';

        const formItemProps = {...this.props};
        const ignoreProps = ['className', 'style', 'width', 'float', 'labelWidth', 'labelSpaceCount', 'labelFontSize'];
        ignoreProps.forEach(item => {
            Reflect.deleteProperty(formItemProps, item);
        });

        return (
            <div {...wrapperProps} ref={node => this.formItemDom = node}>
                <FormItem {...formItemProps}>
                    {children}
                </FormItem>
            </div>
        );
    }
}
