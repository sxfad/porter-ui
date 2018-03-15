/**
 * Created by lhyin on 2018/14/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Radio, Select, Row, Col, DatePicker} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import moment from 'moment';
import {browserHistory} from 'react-router';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {session} from 'sx-ui/utils/storage';
import './style.less';
import connectComponent from '../../../redux/store/connectComponent';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/dataSource/+add/:userId';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        SourceType: [],
    };

    componentWillMount() {
        this.renderSourceType();
    }

    /**
     * 数据类型列表
     */
    renderSourceType = () => {
        let sourceTypeList = session.getItem('sourceType');
        if (sourceTypeList === null) {
            promiseAjax.get(`/dict/all`).then(rsp => {
                console.log(rsp);
                if (rsp.data != undefined) {
                    this.setState({
                        SourceType: rsp.data.SourceType,
                    });
                    session.setItem('sourceType', rsp.data.SourceType);
                    sourceTypeList = rsp.data.SourceType;
                }
            }).finally(() => {
            });
        }

        console.log(sourceTypeList);

        // return sourceTypeList.map((key, value) => {
        //     console.log(key, value);
        // const keyStr = item.applicationId,
        //     valueStr = item.applicationCode;
        // return <Option key={keyStr}>{valueStr}</Option>;
        // });
        return
        for (let key in sourceTypeList) {
            console.log(key);
            console.log(sourceTypeList[key]);
            return <Radio value={sourceTypeList[key]}>{key}</Radio>
        }
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14},
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 14,
                    offset: 6,
                },
            },
        };
        return (
            <PageContent>
                <div>
                    <div className="sub-title">新增数据源</div>
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem
                            {...formItemLayout}
                            label="数据源名称"
                            hasFeedback
                        >
                            {getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: 'The input is not valid E-mail!',
                                }, {
                                    required: true, message: 'Please input your E-mail!',
                                }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="类型"
                            hasFeedback>
                            {getFieldDecorator('sourceType')(
                                <RadioGroup>
                                    {this.renderSourceType()}
                                </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit" size="large">Register</Button>
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
