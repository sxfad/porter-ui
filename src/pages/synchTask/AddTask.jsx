/**
 * Created by lhyin on 2018/13/3.
 */
import React, {Component} from 'react';
import {Form, Input, Steps, Select, Button, message, Modal, Col, Row} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {session} from 'sx-ui/utils/storage';
import './style.less';
import SelectDataTable from './SelectDataTable';
import SelectDataSourceByType from './SelectDataSourceByType';
import SelectTargetDataTable from './SelectTargetDataTable';
import DataMap from './DataMap';
import SynchTaskDetail from './SynchTaskDetail';
import SelectNode from './SelectNode';
import connectComponent from '../../redux/store/connectComponent';

const FormItem = Form.Item;
const Option = Select.Option;
export const PAGE_ROUTE = '/synchTask/+add/:TaskId';
const Step = Steps.Step;
const steps = [{
    title: '填写任务基本信息',
    content: 'one',
}, {
    title: '填写来源数据信息',
    content: 'two',
}, {
    title: '填写目标数据信息',
    content: 'three',
}, {
    title: '数据映射关系',
    content: 'four',
}, {
    title: '完成',
    content: 'five',
}];
@Form.create()
export class LayoutComponent extends Component {
    state = {
        current: 0,
        userList: [],
        users: [],
        allData: [],
        dictAll: [],
        selectedDataTable: [],
        selectedDataSource: [],
        selectedTargetDataTable: [],
        tables: [],
        dataTableVisible: false, //选择数据表弹出层显示情况
        dataSourceVisible: false,
        targetDataTableVisible: false,
        isEdit: false,
        nodeVisible: false,
        selectedNodes: [],
    };

    next() {
        const {form} = this.props;
        const {allData, selectedDataTable, selectedDataSource, selectedTargetDataTable, tables, selectedNodes} =this.state;
        const current = this.state.current + 1;
        if (current === 1) { //保存第一步内容
            form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    console.log('values', values);
                    var nodeIds = [];
                    for (let i = 0; i < selectedNodes.length; i++) {
                        nodeIds.push(selectedNodes[i].nodeId);
                    }
                    const params = {
                        ...allData,
                        ...values,
                        nodeIds,
                    }
                    this.setState({allData: params});
                    console.log('params', params);
                    this.setState({current});
                }
            })
        } else if (current === 2) {
            form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    console.log('values', values);
                    const params = {
                        ...allData,
                        ...values,
                        sourceDataId: selectedDataSource[0].id,
                        sourceDataTablesId: selectedDataTable[0].id,
                        sourceDataSourceId: selectedDataTable[0].sourceId,
                        jobState: 'NEW',
                    }
                    this.setState({allData: params});
                    console.log('params', params);
                    this.setState({current});
                }
            })
        } else if (current === 3) {
            form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    console.log('values', values);
                    const params = {
                        ...allData,
                        ...values,
                        targetDataTablesId: selectedTargetDataTable[0].id,
                        targetDataSourceId: selectedTargetDataTable[0].sourceId,
                    }
                    this.setState({allData: params});
                    console.log('params', params);
                    this.setState({current});
                }
            })
        } else if (current === 4) {
            console.log('tables', tables);

            if (tables.length === 0) {
                message.warning('映射表信息不能为空', 3);
            } else {
                const params = {
                    ...allData,
                    tables: tables,
                }
                this.setState({allData: params});
                console.log('params', params);
                this.setState({current});
            }
        }
    }

    /**
     * 保存
     */
    allSubmit = ()=> {
        const {allData} =this.state;
        const {params: {TaskId}} = this.props;
        if (TaskId != 'TaskId') {
            promiseAjax.put(`/jobtasks`, allData).then(rsp => {
                if (rsp.success) {
                    message.success('修改成功', 3);
                    history.back();
                }
            });
        } else {
            promiseAjax.post(`/jobtasks`, allData).then(rsp => {
                if (rsp.success) {
                    message.success('添加成功', 3);
                    history.back();
                }
            });
        }

    };

    prev() {
        const current = this.state.current - 1;
        this.setState({current});
    }

    componentWillMount() {
        promiseAjax.get(`/cuser/list`).then(rsp => {
            if (rsp.success) {
                this.setState({
                    userList: rsp.data,
                });
            }
        }).finally(() => {
        });

        // 初始化数据字典
        let dictAllList = session.getItem('dictAll');
        if (dictAllList === null) {
            promiseAjax.get(`/dict/all`).then(rsp => {
                if (rsp.success) {
                    this.setState({
                        dictAll: rsp.data,
                    });
                    session.setItem('dictAll', rsp.data);
                }
            }).finally(() => {
            });
        }

        // 修改任务
        const {params: {TaskId}} = this.props;
        if (TaskId !== 'TaskId') {
            console.log(TaskId);
            const selectedDataSource = [],
                selectedDataTable = [],
                selectedTargetDataTable = [],
                selectedNodes = [];
            promiseAjax.get(`/jobtasks/${TaskId}`).then(rsp => {
                let userStr = [];
                let allJson = [];
                let tables = [];
                if (rsp.success) {
                    for (let i = 0; i < rsp.data.users.length; i++) {
                        userStr.push(rsp.data.users[i].id);
                    }
                    for (let i = 0; i < rsp.data.tables.length; i++) {
                        const tableItem = {};
                        const fields = [];
                        for (let j = 0; j < rsp.data.tables[i].fields.length; j++) {
                            const fieldsItem = {};
                            fieldsItem.sortOrder = rsp.data.tables[i].fields[j].id;
                            fieldsItem.sourceTableField = rsp.data.tables[i].fields[j].sourceTableField;
                            fieldsItem.sourceTableName = rsp.data.tables[i].fields[j].sourceTableName;
                            fieldsItem.targetTableField = rsp.data.tables[i].fields[j].targetTableField;
                            fieldsItem.targetTableName = rsp.data.tables[i].fields[j].targetTableName;
                            fields.push(fieldsItem);
                        }
                        tableItem.fields = fields;
                        tableItem.sourceTableName = rsp.data.tables[i].sourceTableName;
                        tableItem.targetTableName = rsp.data.tables[i].targetTableName;
                        tableItem.ignoreTargetCase = rsp.data.tables[i].ignoreTargetCase;
                        tableItem.forceMatched = rsp.data.tables[i].forceMatched;
                        tableItem.directMapTable = rsp.data.tables[i].directMapTable;
                        tables.push(tableItem);
                    }
                    allJson.id = rsp.data.id;
                    allJson.jobState = rsp.data.jobState.code;
                    allJson.nodeIds = rsp.data.nodeIds;
                    allJson.jobName = rsp.data.jobName;
                    allJson.javaClassName = rsp.data.javaClassName;
                    allJson.javaClassContent = rsp.data.javaClassContent;
                    allJson.sourceConsumeAdt = rsp.data.sourceConsumeAdtName;
                    allJson.sourceConvertAdt = rsp.data.sourceConvertAdtName;
                    // allJson.sourceConsumeAdtName = rsp.data.sourceConsumeAdtName;
                    // allJson.sourceConvertAdtName = rsp.data.sourceConvertAdtName;
                    allJson.sourceDataTablesId = rsp.data.sourceDataTablesId;
                    allJson.sourceDataTablesName = rsp.data.sourceDataTablesName;
                    allJson.sourceDataId = rsp.data.sourceDataId;
                    allJson.sourceDataName = rsp.data.sourceDataName;
                    allJson.sourceDataSourceId = rsp.data.sourceDataSourceId;
                    allJson.targetDataSourceId = rsp.data.targetDataSourceId;
                    allJson.targetLoadAdt = rsp.data.targetLoadAdtName;
                    // allJson.targetLoadAdtName = rsp.data.targetLoadAdtName;
                    allJson.targetDataTablesId = rsp.data.targetDataTablesId;
                    allJson.targetDataTablesName = rsp.data.targetDataTablesName;
                    allJson.userIds = userStr;
                    allJson.tables = tables;

                    const selectedDataSourceItem = {},
                        selectedDataTableItem = {},
                        selectedTargetDataTableItem = {};
                    selectedDataSourceItem.id = rsp.data.sourceDataId;
                    selectedDataSourceItem.name = rsp.data.sourceDataName;
                    selectedDataSource.push(selectedDataSourceItem);
                    selectedDataTableItem.id = rsp.data.sourceDataTablesId;
                    selectedDataTableItem.tableName = rsp.data.sourceDataTablesName;
                    selectedDataTableItem.sourceId = rsp.data.sourceDataSourceId
                    selectedDataTable.push(selectedDataTableItem);
                    selectedTargetDataTableItem.id = rsp.data.targetDataTablesId;
                    selectedTargetDataTableItem.tableName = rsp.data.targetDataTablesName;
                    selectedTargetDataTableItem.sourceId = rsp.data.targetDataSourceId;
                    selectedTargetDataTable.push(selectedTargetDataTableItem);
                    for (let i = 0; i < rsp.data.nodeIds.length; i++) {
                        const selectedNodeItem = {};
                        selectedNodeItem.nodeId = rsp.data.nodeIds[i];
                        selectedNodes.push(selectedNodeItem);
                    }
                    console.log(allJson);
                    this.setState({
                        allData: allJson,
                        users: userStr,
                        selectedDataSource,
                        selectedDataTable,
                        selectedTargetDataTable,
                        selectedNodes,
                        tables,
                        isEdit: true,
                    });
                }
            });
        }
    }

    renderUserList = () => {
        const {userList} =this.state;
        const userListHtml = [];
        for (let key in userList) {
            userListHtml.push(<Option key={userList[key].id}
                                      value={userList[key].id}>{userList[key].loginname}</Option>);
        }
        return userListHtml;
    };

    handleUsersChange = (value) => {
        this.setState({users: value});
    };

    /**
     * 初始化消费插件
     */
    renderSourceConsumeAdt = () => {
        const dictAll = session.getItem('dictAll');
        var consumerPluginHtml = [];
        for (let key in dictAll.ConsumerPlugin) {
            consumerPluginHtml.push(<Select.Option key={key} value={key}>{dictAll.ConsumerPlugin[key]}</Select.Option>);
        }
        return consumerPluginHtml;
    };

    /**
     * 初始化消费转换插件
     */
    renderSourceConvertAdt = () => {
        const dictAll = session.getItem('dictAll');
        var consumeConverterPluginHtml = [];
        for (let key in dictAll.ConsumeConverterPlugin) {
            consumeConverterPluginHtml.push(<Select.Option key={key}
                                                           value={key}>{dictAll.ConsumeConverterPlugin[key]}</Select.Option>);
        }
        return consumeConverterPluginHtml;
    };

    /**
     * 初始化载入插件
     */
    renderTargetLoadAdt = ()=> {
        const dictAll = session.getItem('dictAll');
        var targetLoadAdtHtml = [];
        for (let key in dictAll.LoaderPlugin) {
            targetLoadAdtHtml.push(<Select.Option key={key} value={key}>{dictAll.LoaderPlugin[key]}</Select.Option>);
        }
        return targetLoadAdtHtml;
    };

    changeDataTable(dataTable) {
        const {selectedDataTable, allData} =this.state;
        if (selectedDataTable === undefined || selectedDataTable.length === 0) {
            this.setState({
                selectedDataTable: dataTable,
            });
        } else {
            if (selectedDataTable[0].id != dataTable[0].id) {
                allData.tables = [];
                this.setState({
                    selectedDataTable: dataTable,
                    allData,
                    tables: [],
                });
            } else {
                this.setState({
                    selectedDataTable: dataTable,
                });
            }
        }
    }

    changeDataSource(dataSource) {
        this.setState({
            selectedDataSource: dataSource,
        });
        console.log(dataSource);
    }

    changeTargetDataTable(targetDataTable) {
        const {selectedTargetDataTable, allData} =this.state;
        if (selectedTargetDataTable === undefined || selectedTargetDataTable.length === 0) {
            this.setState({
                selectedTargetDataTable: targetDataTable,
            });
        } else {
            if (selectedTargetDataTable[0].id != targetDataTable[0].id) {
                allData.tables = [];
                this.setState({
                    selectedTargetDataTable: targetDataTable,
                    allData,
                    tables: [],
                });
            } else {
                this.setState({
                    selectedTargetDataTable: targetDataTable,
                });
            }
        }

    }

    changeNode(dataSource) {
        console.log(dataSource);
        this.setState({
            selectedNodes: dataSource,
        });
    }

    handleOk = (e) => {
        const {selectedDataTable} =this.state;
        const {setFieldsValue} = this.props.form;
        setFieldsValue({sourceDataTablesName: selectedDataTable[0].tableName});
        this.setState({
            dataTableVisible: false,
        });
    };

    handleCancel = (e) => {
        this.setState({
            dataTableVisible: false,
        });
    };

    handleDataSourceOk = (e) => {
        const {selectedDataSource} =this.state;
        const {setFieldsValue} = this.props.form;
        setFieldsValue({sourceDataName: selectedDataSource[0].name});
        this.setState({
            dataSourceVisible: false,
        });
    };

    handleDataSourceCancel = (e) => {
        this.setState({
            dataSourceVisible: false,
        });
    };

    handleTargetDataSourceOk = (e) => {
        const {selectedTargetDataTable} =this.state;
        const {setFieldsValue} = this.props.form;
        setFieldsValue({targetDataTablesName: selectedTargetDataTable[0].tableName});
        this.setState({
            targetDataTableVisible: false,
        });
    };

    handleTargetDataSourceCancel = (e) => {
        this.setState({
            targetDataTableVisible: false,
        });
    };

    handleNodeOk = (e) => {
        const {selectedNodes} =this.state;
        const {setFieldsValue} = this.props.form;
        var nodeIdsStr = '';
        for (let i = 0; i < selectedNodes.length; i++) {
            nodeIdsStr = nodeIdsStr + selectedNodes[i].nodeId + ',';
        }
        setFieldsValue({nodeIds: nodeIdsStr.substring(0, nodeIdsStr.length - 1)});
        this.setState({
            nodeVisible: false,
        });
    };

    handleNodeCancel = (e) => {
        this.setState({
            nodeVisible: false,
        });
    };

    /**
     * 点击 input 选择节点
     */
    selectNode = () => {
        this.setState({
            nodeVisible: true,
        })
    };

    /**
     * 点击 input 选择元数据表组
     */
    selectDataTable = () => {
        this.setState({
            dataTableVisible: true,
        })
    };

    /**
     * 点击 input 选择同步数据来源
     */
    selectDataSource = () => {
        this.setState({
            dataSourceVisible: true,
        })
    };

    /**
     * 点击 input 选择目标数据表组
     */
    selectTargetDataTable = ()=> {
        this.setState({
            targetDataTableVisible: true,
        })
    };

    /**
     * 保存数据映射关系
     */
    saveDataMap = (tables)=> {
        this.setState({tables});
        console.log(tables);
    };

    render() {
        const {params: {TaskId}} = this.props;
        const {getFieldDecorator} = this.props.form;
        const {current, users, allData, dataTableVisible, dataSourceVisible, targetDataTableVisible, selectedDataTable, selectedTargetDataTable, nodeVisible} = this.state;
        const stepsNum = steps[this.state.current].content;
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

        var stepsHtml = [];
        if (this.state.current === 0) {
            stepsHtml = <Form>
                <FormItem
                    {...formItemLayout}
                    label="任务名称"
                    hasFeedback
                >
                    {getFieldDecorator('jobName', {
                        rules: [{required: true, message: '请输入任务名称'}],
                        initialValue: allData && allData.jobName
                    })(
                        <Input placeholder="请输入任务名称" disabled={this.state.isEdit}/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="分发节点"
                    hasFeedback
                >
                    {getFieldDecorator('nodeIds', {
                        initialValue: allData && allData.nodeIds
                    })(
                        <Input onClick={() => this.selectNode()} placeholder="请选择分发节点"/>
                    )}
                </FormItem>
                {/*<FormItem*/}
                    {/*{...formItemLayout}*/}
                    {/*label="告警通知人"*/}
                    {/*hasFeedback>*/}
                    {/*{getFieldDecorator('userIds', {*/}
                        {/*rules: [{required: true, message: '请选择告警通知人'}],*/}
                        {/*initialValue: users*/}
                    {/*})(*/}
                        {/*<Select*/}
                            {/*multiple*/}
                            {/*style={{ width: '100%' }}*/}
                            {/*placeholder="请选择告警通知人"*/}
                            {/*onChange={this.handleUsersChange}*/}
                        {/*>*/}
                            {/*{this.renderUserList()}*/}
                        {/*</Select>*/}
                    {/*)}*/}
                {/*</FormItem>*/}
                <FormItem
                    {...formItemLayout}
                    label="自定义处理类全名"
                    hasFeedback
                >
                    {getFieldDecorator('javaClassName', {
                        initialValue: allData && allData.javaClassName
                    })(
                        <Input placeholder="自定义处理类全名" />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="自定义处理类文件路径"
                    hasFeedback
                >
                    {getFieldDecorator('javaClassContent', {
                        initialValue: allData && allData.javaClassContent
                    })(
                        <Input placeholder="请输入自定义处理类文件路径" />
                    )}
                </FormItem>
            </Form>
        } else if (this.state.current === 1) {
            stepsHtml = <Form>
                <FormItem
                    {...formItemLayout}
                    label="消费插件"
                    hasFeedback
                >
                    {getFieldDecorator('sourceConsumeAdt', {
                        rules: [{required: true, message: '请选择消费插件'}],
                        initialValue: allData && allData.sourceConsumeAdt
                    })(
                        <Select
                            showSearch
                            style={{width: '100%'}}
                            placeholder="请选择消费插件"
                        >
                            {this.renderSourceConsumeAdt()}
                        </Select>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="消费转换插件"
                    hasFeedback
                >
                    {getFieldDecorator('sourceConvertAdt', {
                        rules: [{required: true, message: '请输入消费转换插件'}],
                        initialValue: allData && allData.sourceConvertAdt
                    })(
                        <Select
                            showSearch
                            style={{width: '100%'}}
                            placeholder="请输入消费转换插件"
                        >
                            {this.renderSourceConvertAdt()}
                        </Select>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="元数据表组"
                    hasFeedback>
                    {getFieldDecorator('sourceDataTablesName', {
                        rules: [{required: true, message: '请选择元数据表组'}],
                        initialValue: allData && allData.sourceDataTablesName
                    })(
                        <Input onClick={() => this.selectDataTable()} placeholder="请选择元数据表组"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="同步数据来源"
                    hasFeedback
                >
                    {getFieldDecorator('sourceDataName', {
                        rules: [{required: true, message: '请选择同步数据来源'}],
                        initialValue: allData && allData.sourceDataName
                    })(
                        <Input onClick={() => this.selectDataSource()} placeholder="请选择同步数据来源"/>
                    )}
                </FormItem>
            </Form>
        } else if (this.state.current === 2) {
            stepsHtml = <Form>
                <FormItem
                    {...formItemLayout}
                    label="载入插件"
                    hasFeedback
                >
                    {getFieldDecorator('targetLoadAdt', {
                        rules: [{required: true, message: '请选择载入插件'}],
                        initialValue: allData && allData.targetLoadAdt
                    })(
                        <Select
                            showSearch
                            style={{width: '100%'}}
                            placeholder="请选择载入插件"
                        >
                            {this.renderTargetLoadAdt()}
                        </Select>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="目标数据表组"
                    hasFeedback>
                    {getFieldDecorator('targetDataTablesName', {
                        rules: [{required: true, message: '请选择目标数据表组'}],
                        initialValue: allData && allData.targetDataTablesName
                    })(
                        <Input onClick={() => this.selectTargetDataTable()} placeholder="请选择目标数据表组"/>
                    )}
                </FormItem>
            </Form>
        } else if (this.state.current === 3) {
            stepsHtml = <DataMap selectedDataTable={selectedDataTable} selectedTargetDataTable={selectedTargetDataTable}
                                 saveDataMap={this.saveDataMap.bind(this)} taskId={TaskId}
                                 parentTables={allData.tables}/>
        } else if (this.state.current === 4) {
            stepsHtml = <SynchTaskDetail taskInfo={allData}/>
        }

        return (
            <PageContent>
                <Steps className="steps-title" current={current}>
                    {steps.map(item => <Step key={item.title} title={item.title}/>)}
                </Steps>
                <div className="steps-content">
                    {stepsHtml}
                </div>
                <div className="steps-action">
                    <Row>
                        <Col span={5}></Col>
                        <Col span={15}>
                            {
                                this.state.current < steps.length - 1
                                &&
                                <Button type="primary" onClick={() => this.next()}>下一步</Button>
                            }
                            {
                                this.state.current === steps.length - 1
                                &&
                                <Button type="primary" onClick={() => this.allSubmit()}>提交</Button>
                            }
                            {
                                this.state.current > 0
                                &&
                                <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                                    上一步
                                </Button>
                            }
                        </Col>
                    </Row>
                </div>
                {
                    dataTableVisible ? <Modal
                        title="选择元数据表组"
                        visible={this.state.dataTableVisible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        width='70%'
                        style={{ top: 30 }}
                    >
                        <SelectDataTable changeDataTable={this.changeDataTable.bind(this)}/>
                    </Modal> : null
                }
                {
                    dataSourceVisible ? <Modal
                        title="选择同步数据来源"
                        visible={this.state.dataSourceVisible}
                        onOk={this.handleDataSourceOk}
                        onCancel={this.handleDataSourceCancel}
                        width='70%'
                        style={{ top: 30 }}
                    >
                        <SelectDataSourceByType changeDataSource={this.changeDataSource.bind(this)}/>
                    </Modal> : null
                }
                {
                    targetDataTableVisible ? <Modal
                        title="选择目标数据表组"
                        visible={this.state.targetDataTableVisible}
                        onOk={this.handleTargetDataSourceOk}
                        onCancel={this.handleTargetDataSourceCancel}
                        width='70%'
                        style={{ top: 30 }}
                    >
                        <SelectTargetDataTable changeTargetDataTable={this.changeTargetDataTable.bind(this)}/>
                    </Modal> : null
                }
                {
                    nodeVisible ? <Modal
                        title="选择分发节点"
                        visible={this.state.nodeVisible}
                        onOk={this.handleNodeOk}
                        onCancel={this.handleNodeCancel}
                        width='70%'
                        style={{ top: 30 }}
                    >
                        <SelectNode changeNode={this.changeNode.bind(this)}/>
                    </Modal> : null
                }
            </PageContent>
        );
    }
}
export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
