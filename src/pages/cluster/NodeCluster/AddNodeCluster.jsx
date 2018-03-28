/**
 * Created by lhyin on 2018/14/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Radio, Select, message, Modal, Row, Col, Table} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {session} from 'sx-ui/utils/storage';
import './style.less';
import connectComponent from '../../../redux/store/connectComponent';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/nodeCluster/+add/:NodeId';
@Form.create()
export class LayoutComponent extends Component {
    state = {};

    componentWillMount() {
    }

    /**
     * 提交表单
     */
    handleSubmit = ()=> {
        const {form, form: {getFieldValue}} = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                promiseAjax.post(`/nodes`, values).then(rsp => {
                    if (rsp.success) {
                        message.success('添加成功', 3);
                        history.back();
                    }
                });
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

        return (
            <PageContent>
                <div>
                    <div className="sub-title">新增同步节点</div>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="节点ID"
                            hasFeedback
                        >
                            {getFieldDecorator('nodeId', {
                                rules: [{required: true, message: '请输入节点ID'}],
                            })(
                                <Input placeholder="节点ID"/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="机器名"
                            hasFeedback>
                            {getFieldDecorator('machineName', {
                                rules: [{required: true, message: '请输入机器名'}],
                            })(
                                <Input placeholder="机器名"/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="IP地址"
                            hasFeedback>
                            {getFieldDecorator('ipAddress', {
                                rules: [{required: true, message: '请输入IP地址'}],
                            })(
                                <Input placeholder="IP地址"/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="进程号"
                            hasFeedback>
                            {getFieldDecorator('pidNumber', {
                                rules: [{required: true, message: '请输入进程号'}],
                            })(
                                <Input placeholder="进程号"/>
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
