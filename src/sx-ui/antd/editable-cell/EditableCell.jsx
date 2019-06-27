import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon, Input, Form} from 'antd';
import './style.less';

const FormItem = Form.Item;

export default class EditableCell extends Component {
    static defaultProps = {
        type: 'input', // TODO number textarea password mobile email select select-tree checkbox radio switch
        field: '',
        placeholder: '',
        decorator: {},
        onSubmit: () => {
        },
    }
    static propTypes = {
        form: PropTypes.object.isRequired, // antd 中提供的form
        field: PropTypes.string.isRequired,
        placeholder: PropTypes.string, // 提示
        type: PropTypes.string, // 编辑类型，默认input
        decorator: PropTypes.object, // antd form的 getFieldDecorator 参数
        isRowEdit: PropTypes.bool, // 是否是整行可编辑模式
        showEdit: PropTypes.bool, // 整行编辑模式时，编辑/非编辑形式切换
        onSubmit: PropTypes.func, // 单独单元格编辑时，点击'对号'，表单无校验错误时，将触发此函数，整行编辑模式，此方法无效
    };
    state = {
        value: this.props.value,
        editable: false,
    }
    edit = () => {
        this.setState({editable: true});
        setTimeout(() => {
            this.input.focus();
            this.input.refs.input.select();
        }, 0);
    }
    handleSubmit = () => {
        const {form, onSubmit, field} = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({editable: false});
                onSubmit(values[field]);
            }
        });
    }

    render() {
        const {editable} = this.state;
        let {isRowEdit, showEdit, form: {getFieldDecorator}, field, decorator, placeholder} = this.props;
        let showIcon = true;
        if (isRowEdit) {
            showIcon = false;
        } else {
            showEdit = editable;
        }

        const value = decorator.initialValue;
        return (
            <div className="editable-cell">
                {
                    showEdit ?
                        <div className="editable-cell-input-wrapper">
                            <Form onSubmit={this.handleSubmit}>
                                <FormItem>
                                    {getFieldDecorator(field, decorator)(
                                        <Input ref={node => this.input = node} placeholder={placeholder}/>
                                    )}
                                </FormItem>
                            </Form>
                            {
                                showIcon ?
                                    <Icon
                                        type="check"
                                        className="editable-cell-icon-check"
                                        onClick={this.handleSubmit}
                                    />
                                    : null
                            }

                        </div>
                        :
                        <div className="editable-cell-text-wrapper">
                            {value || ' '}
                            {
                                showIcon ?
                                    <Icon
                                        type="edit"
                                        className="editable-cell-icon"
                                        onClick={this.edit}
                                    />
                                    : null
                            }
                        </div>
                }
            </div>
        );
    }
}
