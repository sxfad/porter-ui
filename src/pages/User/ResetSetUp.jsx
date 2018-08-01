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
export const PAGE_ROUTE = '/resetsetup';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        codeList: [],
        userInfo: {},
        isAdmin: true,
    };

    componentWillMount() {
        promiseAjax.get(`/getuserinfo`).then(res => {
            if (res.success) {
                promiseAjax.get(`/cuser/${res.data.userId}`).then(rsp => {
                    this.setState({userInfo: rsp.data})
                })

            }
        })
    }

    /**
     * 提交表单
     */
    handleSubmit = ()=> {
        const {form} = this.props;
        promiseAjax.get(`/getuserinfo`).then(res => {
            if (res.success) {
                form.validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        promiseAjax.put(`cuser/${res.data.userId}`, values).then(rsp => {
                            if (rsp.success) {
                                message.success('修改成功', 3);
                                this.props.closeSetUpModal();
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
                        label="昵称"
                        hasFeedback>
                        {getFieldDecorator('nickname', {
                            rules: [{required: true, message: '请输入昵称'}],
                            initialValue: userInfo.nickname === undefined ? '' : userInfo.nickname
                        })(
                            <Input placeholder="请输入昵称"/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="邮箱"
                        hasFeedback>
                        {getFieldDecorator('email', {
                            rules: [{required: true, message: '请输入邮箱'}, {
                                type: 'email', message: '请输入正确格式的邮箱'
                            }, {
                                validator: this.validateEmail,
                            }],
                            initialValue: userInfo.email === undefined ? '' : userInfo.email
                        })(
                            <Input placeholder="请输入邮箱"/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="手机号"
                        hasFeedback>
                        {getFieldDecorator('mobile', {
                            rules: [{required: true, message: '请输入手机号'}],
                            initialValue: userInfo.mobile === undefined ? '' : userInfo.mobile
                        })(
                            <Input placeholder="请输入手机号"/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="部门"
                        hasFeedback>
                        {getFieldDecorator('departMent', {
                            rules: [{required: true, message: '请输入部门'}],
                            initialValue: userInfo.departMent === undefined ? '' : userInfo.departMent
                        })(
                            <Input placeholder="departMent"/>
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
