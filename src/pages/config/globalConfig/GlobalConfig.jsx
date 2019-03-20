/**
 * Created by lhyin on 2018/14/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Radio, Select, message, DatePicker, Row, Col} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {session} from 'sx-ui/utils/storage';
import './style.less';
import connectComponent from '../../../redux/store/connectComponent';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
export const PAGE_ROUTE = '/globalConfig';

@Form.create()

export class LayoutComponent extends Component {
    state = {
        AlertPlugin: [],
        fieldType: [],  //当前类型对应的字段
        userList: [],
        userListHtml: [],
        configType: 'alarm', //设置类型
        alarmInfo: [],
        alarmType: '',
        users: [],
        logLevel: '', //当前日志级别
        LogLevelEnum: '',
    };

    componentDidMount() {
        const {configType} = this.state;
        const {form: {setFieldsValue, getFieldValue}} = this.props;

        if (configType === 'alarm') {
            this.getFiledTypeByThis();
        }

        promiseAjax.get(`/cuser/list`).then(rsp => {
            if (rsp.success) {
                this.setState({
                    userList: rsp.data,
                });
            }
        }).finally(() => {
        });

        const alarmType = getFieldValue('alarmType');

        promiseAjax.get(`/loggrade`).then(rsp => {
            if (rsp.success) {
                this.setState({
                    logLevel: rsp.data.logLevel.code,
                });
            }
        }).finally(() => {
        });
    }

    /**
     * 渲染日志类型
     * @returns {Array}
     */
    renderLogType = () => {
        let logList = session.getItem('logLevelEnum');
        if (logList === null) {
            promiseAjax.get(`/dict/all`).then(rsp => {
                if (rsp.data != undefined) {
                    this.setState({
                        LogLevelEnum: rsp.data.LogLevelEnum,
                    });
                    session.setItem('logLevelEnum', rsp.data.LogLevelEnum);
                    logList = rsp.data.LogLevelEnum;
                }
            }).finally(() => {
            });
        }

        const logTypeHtml = [];
        for (let key in logList) {
            logTypeHtml.push(<Radio key={key} value={key}>{logList[key]}</Radio>);
        }
        return logTypeHtml;
    };

    /**
     * 告警方式
     */
    renderAlertPlugin = () => {
        let alertPluginList = session.getItem('alertPlugin');
        if (alertPluginList === null) {
            promiseAjax.get(`/dict/all`).then(rsp => {
                if (rsp.success) {
                    this.setState({
                        AlertPlugin: rsp.data.AlertPlugin,
                    });
                    session.setItem('alertPlugin', rsp.data.AlertPlugin);
                    alertPluginList = rsp.data.AlertPlugin;
                }
            }).finally(() => {
            });
        }

        const alertPluginHtml = [];
        for (let key in alertPluginList) {
            alertPluginHtml.push(<Radio key={key} value={key}>{alertPluginList[key]}</Radio>);
        }
        return alertPluginHtml;
    };

    renderUserList = () => {
        const {userList} = this.state;
        const userListHtml = [];
        for (let key in userList) {
            userListHtml.push(<Option key={userList[key].id}
                                      value={userList[key].id}>{userList[key].loginname}</Option>);
        }
        return userListHtml;
    };

    /**
     * 选择数据源类型
     */
    selectAlertPluginType = (e) => {
        const alertPluginType = e.target.value;  //选择的数据源类型
        this.getFieldType(alertPluginType);
    };

    getFieldTypeInfo = (dataSource) => {
        this.setState({fieldType: dataSource});
        dataSource.forEach(item => {
            const {fieldTypeKey, fieldType} = item;
            if (fieldType === 'RADIO') {
                promiseAjax.get(`/dict/${fieldTypeKey}`)
                    .then(res => {
                        if (res.success && res.data) {
                            item.radioTypeList = {...res.data};
                            this.setState({fieldType: dataSource});
                        }
                    });
            }
        });
    };

    /**
     * 获取表单列表(根据选择的数据源类型)
     */
    getFieldType = (alertPluginType) => {
        promiseAjax.get(`/alarm/info`).then(rsp => {
            if (rsp.success && rsp.data != null) {
                const alarmInfo = rsp.data.alarmPlugins;
                const alarmUsers = rsp.data.alarmUsers;
                const users = alarmUsers.map(item => item.userId);
                promiseAjax.get(`/dicalarmplugin/${alertPluginType}`).then(rsp1 => {
                    if (rsp1.success) {
                        const fieldType = rsp1.data;
                        fieldType.map((key, value) => {
                            alarmInfo.map((key1, value1) => {
                                if (alarmInfo[value1].pluginCode === fieldType[value].fieldCode) {
                                    fieldType[value].pluginValue = alarmInfo[value1].pluginValue;
                                }
                            })
                        });
                        this.setState({users, alarmInfo: rsp.data});
                        this.getFieldTypeInfo(fieldType);
                    }
                });
            } else {
                promiseAjax.get(`/dicalarmplugin/${alertPluginType}`).then(rsp1 => {
                    if (rsp1.success) {
                        const fieldType = rsp1.data;
                        fieldType.map((key, value) => {
                            fieldType[value].pluginValue = ''
                        });
                        this.getFieldTypeInfo(fieldType);
                    }
                });
            }
        });
    };

    /**
     * 获取表单列表(根据已保存的数据源类型)
     */
    getFiledTypeByThis = () => {
        promiseAjax.get(`/alarm/info`).then(rsp => {
            if (rsp.success && rsp.data != null) {
                const alarmInfo = rsp.data.alarmPlugins,
                    alarmUsers = rsp.data.alarmUsers;
                const users = [];
                alarmUsers.map((k, v) => {
                    users.push(alarmUsers[v].userId);
                });
                promiseAjax.get(`/dicalarmplugin/${rsp.data.alarmType.code}`).then(rsp1 => {
                    if (rsp1.success) {
                        const fieldType = rsp1.data;
                        fieldType.map((key, value) => {
                            alarmInfo.map((key1, value1) => {
                                if (alarmInfo[value1].pluginCode === fieldType[value].fieldCode) {
                                    fieldType[value].pluginValue = alarmInfo[value1].pluginValue;
                                }
                            })
                        });

                        this.setState({users});
                        this.getFieldTypeInfo(fieldType);
                    }
                }).finally(() => {
                });

                this.setState({
                    alarmInfo: rsp.data,
                });
            }
        }).finally(() => {
        });
    }

    /**
     * 提交表单
     */
    handleSubmit = () => {
        const {form} = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const alarmPlugins = [];
                for (let key in values) {
                    if (key.indexOf("--") != -1) {
                        const pluginsItem = {};
                        const arr = key.split('--');
                        pluginsItem.pluginCode = arr[0];
                        pluginsItem.pluginName = arr[1];
                        pluginsItem.pluginValue = values[key];
                        pluginsItem.alarmType = 'string';
                        alarmPlugins.push(pluginsItem);
                        delete values[key];
                    }
                }
                const users1 = [],
                    users = [];
                const alarmUsers = [...values.alarmUsers];
                for (let key in values.alarmUsers) {
                    const usersItem = {};
                    usersItem.userId = alarmUsers[key];
                    users1.push(usersItem);
                    users.push(alarmUsers[key]);
                    delete alarmUsers[key];
                }

                values.alarmUsers = users1;
                values.alarmPlugins = alarmPlugins;

                promiseAjax.post(`/alarm`, values).then(rsp => {
                    if (rsp.success) {
                        message.success('修改成功', 3);
                    }
                });
            }
        })
    };

    /**
     * 提交其他设置信息
     */
    handleOtherSubmit = () => {
        const {form} = this.props;
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                promiseAjax.post(`/loggrade`, values).then(rsp => {
                    if (rsp.success) {
                        this.setState({
                            logLevel: values.logLevel,
                        });
                        message.success('修改成功', 3);
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

    renderFormItemsHtml = () => {
        const {fieldType} = this.state;
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
        const formItemsHtml = [];
        fieldType.forEach((item, index) => {
            if (item.fieldType === 'TEXT') {
                formItemsHtml.push(
                    <FormItem
                        {...formItemLayout}
                        label={item.fieldName}
                        key={item.fieldCode}
                        hasFeedback
                    >
                        {getFieldDecorator(`${item.fieldCode}--${item.fieldName}`, {
                            initialValue: item && item.pluginValue,
                            rules: [{required: true, message: '请输入' + item.fieldName}],
                        })(
                            <Input style={{width: '100%', marginRight: 8}}/>
                        )}
                    </FormItem>
                );
            }

            if (item.fieldType === 'RADIO') {
                const radioTypeHtml = [];
                for (let key in item.radioTypeList) {
                    radioTypeHtml.push(
                        <Radio
                            key={item.radioTypeList[key]}
                            value={key}>
                            {item.radioTypeList[key]}
                        </Radio>
                    );
                }
                formItemsHtml.push(
                    <FormItem
                        {...formItemLayout}
                        label={item.fieldName}
                        key={item.fieldCode}
                        hasFeedback
                    >
                        {getFieldDecorator(`${item.fieldCode}--${item.fieldName}`, {
                            initialValue: item.pluginValue || 'false',
                        })(
                            <RadioGroup>
                                {radioTypeHtml}
                            </RadioGroup>
                        )}
                    </FormItem>
                );
            }
        });
        return formItemsHtml;
    };

    setConfigTypeAlarm = () => {
        const {alarmType} = this.state;
        this.setState({configType: 'alarm'});
        this.getFiledTypeByThis();
    }

    setConfigTypeOther = () => {
        const {alarmType} = this.state;
        this.setState({configType: 'other'});
    }

    handleUsersChange = (value) => {
        this.setState({users: value});
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {fieldType, alarmInfo, users, configType, logLevel} = this.state;
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

        return (
            <PageContent>
                <div>
                    <div className="sub-title">全部设置</div>
                    <Row>
                        <Col span={5} className="leftMenu">
                            <div className="left-SubTitle" onClick={() => {
                                this.setConfigTypeAlarm()
                            }}><FontIcon
                                type="fa-bomb"/>告警设置
                            </div>
                            <div className="left-SubTitle" onClick={() => {
                                this.setConfigTypeOther()
                            }}><FontIcon
                                type="fa-cog"/>其他设置
                            </div>
                        </Col>
                        <Col span={19}>
                            {
                                configType === 'alarm' ? <Form>
                                    <FormItem
                                        {...formItemLayout}
                                        label="告警方式"
                                        hasFeedback>

                                        {getFieldDecorator('alarmType', {
                                            initialValue: alarmInfo.alarmType && alarmInfo.alarmType.code
                                        })(
                                            <RadioGroup onChange={this.selectAlertPluginType}>
                                                {this.renderAlertPlugin()}
                                            </RadioGroup>
                                        )}
                                    </FormItem>

                                    {this.renderFormItemsHtml()}

                                    <FormItem
                                        {...formItemLayout}
                                        label="告警通知人"
                                        hasFeedback>
                                        {getFieldDecorator('alarmUsers', {
                                            initialValue: users,
                                            rules: [{required: true, message: '请选择告警通知人'}],
                                        })(
                                            <Select
                                                mode="multiple"
                                                style={{width: '100%'}}
                                                placeholder="请选择告警通知人"
                                                onChange={this.handleUsersChange}
                                            >
                                                {this.renderUserList()}
                                            </Select>
                                        )}
                                    </FormItem>


                                    <FormItem {...tailFormItemLayout}>
                                        <Button type="primary" onClick={() => this.handleSubmit()}
                                                style={{marginRight: 16}}
                                                size="large">提交</Button>
                                        <Button type="ghost" htmlType="reset" size="large"
                                                onClick={this.resetFieldsForm}
                                                style={{marginRight: 16}}>
                                            重置
                                        </Button>
                                    </FormItem>

                                </Form> : <Form><FormItem
                                    {...formItemLayout}
                                    label="日志级别"
                                    hasFeedback>
                                    {getFieldDecorator('logLevel', {
                                        initialValue: logLevel
                                    })(
                                        <RadioGroup>
                                            {this.renderLogType()}
                                        </RadioGroup>
                                    )}
                                </FormItem>
                                    <FormItem {...tailFormItemLayout}>
                                        <Button type="primary" onClick={() => this.handleOtherSubmit()}
                                                style={{marginRight: 16}}
                                                size="large">提交</Button>
                                        <Button type="ghost" htmlType="reset" size="large"
                                                onClick={this.resetFieldsForm}
                                                style={{marginRight: 16}}>
                                            重置
                                        </Button>
                                    </FormItem>
                                </Form>
                            }

                        </Col>
                    </Row>
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
