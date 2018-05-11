/**
 * Created by lhyin on 2018/14/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Radio, Select, message, DatePicker} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {session} from 'sx-ui/utils/storage';
import './style.less';
import connectComponent from '../../../redux/store/connectComponent';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/dataSource/+add/:DataSourceId';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        SourceType: [],
        fieldType: [],  //当前类型对应的字段
    };

    componentWillMount() {
    }

    /**
     * 数据类型列表
     */
    renderSourceType = () => {
        let sourceTypeList = session.getItem('sourceType');
        if (sourceTypeList === null) {
            promiseAjax.get(`/dict/all`).then(rsp => {
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

        var sourceTypeHtml = [];
        for (let key in sourceTypeList) {
            sourceTypeHtml.push(<Radio key={key} value={key}>{sourceTypeList[key]}</Radio>);
        }
        return sourceTypeHtml;
    };

    /**
     * 选择数据源类型
     */
    selectSourceType = (e)=> {
        const sourceType = e.target.value;  //选择的数据源类型
        promiseAjax.get(`/dicdatasourceplugin/${sourceType}`).then(rsp => {
            if (rsp.success) {
                var fieldType = rsp.data;
                var list = [];
                fieldType.map((k, index) => {
                    if (fieldType[index].fieldType.code === 'RADIO') {
                        var type = fieldType[index].fieldTypeKey;
                        promiseAjax.get(`/dict/${type}`).then(rspradio => {
                            if (rspradio.success) {
                                var radioTypeList = {};
                                var radioData = rspradio.data;
                                for (let key in radioData) {
                                    radioTypeList[key] = radioData[key];
                                }
                                fieldType[index].radioTypeList = radioTypeList;
                            }
                        })
                    }
                });
                list = fieldType;
                setTimeout(() => {
                    this.setState({
                        fieldType: list,
                    });
                }, 100);
            }
        }).finally(() => {
        });
    };

    /**
     * 提交表单
     */
    handleSubmit = ()=> {
        const {form} = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var plugins = [];
                for (let key in values) {
                    if (key.indexOf("--") != -1) {
                        var pluginsItem = {};
                        var arr = key.split('--');
                        pluginsItem.fieldCode = arr[0];
                        pluginsItem.fieldName = arr[1];
                        pluginsItem.fieldValue = values[key];
                        plugins.push(pluginsItem);
                        delete values[key];
                    }
                }
                values.plugins = plugins;
                promiseAjax.post(`/datasource`, values).then(rsp => {
                    if (rsp.success) {
                        message.success('添加成功', 3);
                        history.back();
                    }
                });
            }
        })
    };

    /**
     * 充值表单数据
     */
    resetFieldsForm = () => {
        this.props.form.resetFields();
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {fieldType} =this.state;
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
                    span: 14,
                    offset: 5,
                },
            },
        };

        var formItemsHtml = [];

        fieldType.map((k, index) => {
            if (fieldType[index].fieldType.code === 'TEXT') {
                formItemsHtml.push(
                    <FormItem
                        {...formItemLayout}
                        label={fieldType[index].fieldName}
                        key={fieldType[index].fieldCode}
                        hasFeedback
                    >
                        {getFieldDecorator(`${fieldType[index].fieldCode}--${fieldType[index].fieldName}`, {
                            rules: [{required: true, message: '请输入' + fieldType[index].fieldName+' '+ fieldType[index].fieldExplain }],
                        })(
                            <Input style={{ width: '60%', marginRight: 8 }}/>
                        )}
                    </FormItem>
                );
            } else if (fieldType[index].fieldType.code === 'RADIO') {
                var radioTypeHtml = [];
                for (let key in fieldType[index].radioTypeList) {
                    radioTypeHtml.push(<Radio key={fieldType[index].radioTypeList[key]}
                                              value={key}>{fieldType[index].radioTypeList[key]}</Radio>);
                }
                formItemsHtml.push(
                    <FormItem
                        {...formItemLayout}
                        label={fieldType[index].fieldName}
                        key={fieldType[index].fieldCode}
                        hasFeedback
                    >
                        {getFieldDecorator(`${fieldType[index].fieldCode}--${fieldType[index].fieldName}`,{
                            rules: [{required: true, message: '请选择' + fieldType[index].fieldName}],
                        })(
                            <RadioGroup>
                                {radioTypeHtml}
                            </RadioGroup>
                        )}
                    </FormItem>
                );
            }
        });

        return (
            <PageContent>
                <div>
                    <div className="sub-title">新增数据源</div>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="数据源名称"
                            hasFeedback
                        >
                            {getFieldDecorator('name', {
                                rules: [{required: true, message: '请输入数据源名称'}],
                            })(
                                <Input placeholder="数据源名称"/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="数据源类型"
                            hasFeedback>
                            {getFieldDecorator('dataType', {
                                rules: [{required: true, message: '请选择数据源类型'}],
                            })(
                                <RadioGroup onChange={this.selectSourceType}>
                                    {this.renderSourceType()}
                                </RadioGroup>
                            )}
                        </FormItem>

                        {formItemsHtml}
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
