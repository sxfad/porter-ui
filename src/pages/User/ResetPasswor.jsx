/**
 * Created by lhyin on 2018/14/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Radio, Select, message, Modal, Row, Col, Table} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {session} from 'sx-ui/utils/storage';
import './style.less';
import connectComponent from '../../redux/store/connectComponent';

const md5 = require('../common/md5');
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/resetpwd';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        codeList: [],
        userInfo: {},
        isAdmin: true,
    };

    componentWillMount() {
    }

    /**
     * 提交表单
     */
    handleSubmit = ()=> {
        promiseAjax.get(`/getuserinfo`).then(res => {
            if (res.success) {
                const {form, form: {getFieldValue}} = this.props;
                form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        promiseAjax.put(`cuser/${res.data.userId}`, {loginpw: md5(values.loginpw)}).then(rsp => {
                            if (rsp.success) {
                                message.success('修改成功', 3);
                                this.props.closeModal();
                            }
                        });

                    }
                })
            }
        })
    };

    /**
     * 重置表单数据
     */
    resetFieldsForm = () => {
        this.props.form.resetFields();
    };

    checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('loginpw')) {
            callback('请输入相同的密码');
        } else {
            callback();
        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {userInfo} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 5},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15},
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 15,
                    offset: 5,
                },
            },
        };

        console.log(userInfo.loginname);

        return (
            <PageContent>
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="新密码"
                        hasFeedback
                    >
                        {getFieldDecorator('loginpw', {
                            rules: [{required: true, message: '请输入新密码'}],
                        })(
                            <Input placeholder="请输入新密码"/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="重复输入新密码"
                        hasFeedback
                    >
                        {getFieldDecorator('confirmPassword', {
                            rules: [{required: true, message: '请重复输入新密码'}, {
                                validator: this.checkPassword,
                            }],
                        })(
                            <Input placeholder="请重复输入新密码"/>
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" onClick={() => this.handleSubmit()} style={{marginRight: 16}}
                                size="large">提交</Button>
                        <Button type="ghost" htmlType="reset" size="large" onClick={this.resetFieldsForm}
                                style={{marginRight: 16}}>
                            重置
                        </Button>
                    </FormItem>
                </Form>
            </PageContent>
        )
    }
}

export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
