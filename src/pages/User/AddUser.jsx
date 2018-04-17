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
export const PAGE_ROUTE = '/user/+add/:UserId';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        codeList: [],
        userInfo: {},
    };

    componentWillMount() {
        promiseAjax.get(`/crole`).then(rsp => {
            if (rsp.success) {
                this.setState({codeList: rsp.data})
            }
        }).finally(() => {
        });

        const {params: {UserId}} = this.props;
        if (UserId != 'UserId') {
            promiseAjax.get(`/cuser/${UserId}`).then(rsp => {
                this.setState({userInfo: rsp.data})
            })
        }
    }

    componentDidMount() {
        document.getElementById('adduserform').getElementsByTagName('form')[0].setAttribute('autocomplete', 'off');
    }

    /**
     * 提交表单
     */
    handleSubmit = ()=> {
        const {form, form: {getFieldValue}} = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.loginpw = md5(values.loginpw);
                const {params: {UserId}} = this.props;
                if (UserId !== 'UserId') {
                    promiseAjax.post(`cuser/${UserId}`, values).then(rsp => {
                        if (rsp.success) {
                            message.success('修改成功', 3);
                            history.back();
                        }
                    });
                } else {
                    promiseAjax.post(`cuser`, values).then(rsp => {
                        if (rsp.success) {
                            message.success('添加成功', 3);
                            history.back();
                        }
                    });
                }
            }
        })
    };

    /**
     * 重置表单数据
     */
    resetFieldsForm = () => {
        this.props.form.resetFields();
    };

    /**
     * 初始化角色
     */
    renderRoleCodeOptions = () => {
        const {codeList} = this.state;
        const userRoleHtml = [];
        for (let key in codeList) {
            userRoleHtml.push(<Option key={codeList[key].roleCode}
                                      value={codeList[key].roleCode}>{codeList[key].roleName}</Option>);
        }
        return userRoleHtml;
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
                <div id="adduserform">
                    <div className="sub-title">新增同步节点</div>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="登录名"
                            hasFeedback
                        >
                            {getFieldDecorator('loginname', {
                                rules: [{required: true, message: '请输入登录名'}],
                                initialValue: userInfo.loginname === undefined ? '' : userInfo.loginname
                            })(
                                <Input placeholder="请输入登录名"/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="登录密码"
                            hasFeedback>
                            {getFieldDecorator('loginpw', {
                                rules: [{required: true, message: '请输入登录密码'}],
                                initialValue: userInfo.loginpw === undefined ? '' : userInfo.loginpw
                            })(
                                <Input type="password" placeholder="请输入登录密码"/>
                            )}
                        </FormItem>
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
                                rules: [{required: true, message: '请输入邮箱'}],
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
                        <FormItem
                            {...formItemLayout}
                            label="角色"
                            hasFeedback>
                            {getFieldDecorator('roleCode', {
                                rules: [{required: true, message: '请选择角色'}],
                                initialValue: userInfo.roleCode === undefined ? '' : userInfo.roleCode
                            })(
                                <Select
                                    placeholder="请选择角色"
                                >
                                    {this.renderRoleCodeOptions()}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" onClick={() => this.handleSubmit()} style={{marginRight: 16}}
                                    size="large">提交</Button>
                            <Button type="ghost" htmlType="reset" size="large" onClick={this.resetFieldsForm}
                                    style={{marginRight: 16}}>
                                重置
                            </Button>
                            <Button type="primary" onClick={() => { history.back(); }} size="large">返回</Button>
                        </FormItem>
                    </Form>
                </div>

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