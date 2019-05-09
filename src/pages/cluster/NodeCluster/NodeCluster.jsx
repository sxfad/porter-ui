/**
 * Created by lhyin on 2018/19/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, Select, message, Popconfirm, Radio, Modal} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import './style.less';
import {browserHistory} from 'react-router';
import connectComponent from '../../../redux/store/connectComponent';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

export const PAGE_ROUTE = '/nodeCluster';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        application: [],
        startTimeStr: '', //开始时间
        endTimeStr: '',   //结束时间(默认当前时间)
        endTime: Date(),
        dataSource: [],
        tabLoading: false,
        visible: false,
        record: null,
        confirmLoading: false,
        visableTable: false,
        dicControlTypePlugins:[],
        data: [],
        loading: false,
        dataRirht: [],
        valueChange: null,
        selectedRowKeys: null,
        modalSelectData: [],
    };

    columns = [
        {
            title: '编号',
            key: "编号",
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
        },
        {
            title: '节点ID',
            key: "nodeId",
            render: (text, record) => {
                return (
                    record.nodeId
                );
            },
        },
        {
            title: '机器名称',
            key: "machineName",
            render: (text, record) => {
                return (
                    record.machineName
                );
            },
        },
        {
            title: 'IP地址',
            key: "ipAddress",
            render: (text, record) => {
                return (
                    record.ipAddress
                );
            },
        },
        {
            title: '心跳时间',
            key: "heartBeatTime",
            render: (text, record) => {
                return (
                    record.heartBeatTime
                );
            },
        },
        {
            title: '进程号',
            key: "pidNumber",
            render: (text, record) => {
                return (
                    record.pidNumber
                );
            },
        },
        {
            title: '状态',
            key: "state",
            render: (text, record) => {
                if (record.state === -1) {
                    return (
                        <span className="gray-text">离线</span>
                    );
                } else if (record.state === 1) {
                    return (
                        <span className="green-text">在线</span>
                    );
                }

            },
        },
        {
            title: '权限设置',
            dataIndex: 'PermissionSet',
            key: 'PermissionSet',
            render: (text, record) => (
                <a
                    onClick={
                        () => this.showModal(record)
                    }
                >
                    设置
                </a>
            )
        },
        {
            title: '任务推送状态',
            key: "taskPushState",
            render: (text, record) => {
                return (
                    record.taskPushState && record.taskPushState.name
                );
            },
        },
        {
            title: '操作',
            key: "opr",
            render: (text, record) => {
                if (record.state === -1) {
                    return (
                        <span>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                              <a href="#">删除</a>
                            </Popconfirm>
                        </span>
                    )
                } else if (record.taskPushState.code === 'SUSPEND' && record.state === 1) {
                    return (
                        <span>
                            <a onClick={() => this.handlePush('WORKING', record.id)}>接收任务推送</a>
                            <span className="ant-divider"/>

                            <a onClick={() => this.handleStopTask(record.id)}>停止当前任务</a>
                            <span className="ant-divider"/>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                              <a href="#">删除</a>
                            </Popconfirm>
                        </span>
                    )
                } else {
                    return (
                        <span>
                            <a onClick={() => this.handlePush('SUSPEND', record.id)}>停止接收任务推送</a>
                            <span className="ant-divider"/>

                            <a onClick={() => this.handleStopTask(record.id)}>停止当前任务</a>
                            <span className="ant-divider"/>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                              <a href="#">删除</a>
                            </Popconfirm>
                        </span>
                    )
                }
            }
        },
    ];

    /**
     *权限设置columns
     */
    setTingsForm = [
        {
            name: "节点所有者",
            key: "name",
            init: null,
            rule: null,
            labelCol: 10,
            wrapperCol: 14,
            disable: true,
            span: 7,
            type: "input"
        },{
            name: "节点共享者",
            key: "shareOwner",
            init: null,
            rule: null,
            labelCol: 5,
            wrapperCol: 18,
            disable: true,
            span: 14,
            type:  "input"
        },{
            name: "操作类型",
            key: "oprType",
            labelCol: 3,
            wrapperCol: 7,
            disable: false,
            span: 23,
            type: "radio"
        }
    ];

    columnsModal = [{
        title: '用户',
        dataIndex: 'nickname',
    },{
        title: '部门',
        dataIndex: 'departMent',
      }
    ];

    componentDidMount() {
        this.search();
        this.requestAjax();
    }


    /**
     * 权限设置
     */
    showModal = (record) => {
        promiseAjax.get(`/nodesowner/setPage/${record.nodeId}`).then(
            res => {
                this.props.form.setFieldsValue({
                    name:res.data.owner ? res.data.owner.name : "无",
                    shareOwner: res.data.shareOwner ? this.aryOper(res.data.shareOwner,"name").join(",") : "无"
                });
                this.setState({
                    dicControlTypePlugins: res.data.dicControlTypePlugins,
                    owner: res.data.owner,
                    shareOwner: res.data.shareOwner
                })
            }
        );
        this.setState({
            visible: true,
            record,
        });
    };

    /**
     * 处理数组问题
     * @param ary
     * @param val
     * @returns {Array}
     */
    aryOper = (ary,val) => {
        let arry = [];
        ary && ary.map (
            v => {
                arry.push(v[val])
            }
        );
        return arry
    };

    /**
     * 操作类型数据处理
     * @param e
     */
    dataProcessing = (e) => {
        const {shareOwner, modalSelectData} = this.state;
        let arry = this.state.owner
            ? modalSelectData.filter(
                v => v.id !== this.state.owner.ownerId
            )
            : modalSelectData;
        let rowKeys = [];
        let rowData = [];
        if (e === "SHARE") {
            let ownerId = this.aryOper(shareOwner,"ownerId");
            arry.forEach(
                v => {
                    if(ownerId.indexOf(v.id) !== -1) {
                        rowKeys.push(v.id);
                        rowData.push(v)
                    }

                }
            );
        }
        this.setState({
            data: arry,
            loading: false,
            selectedRowKeys:rowKeys,
            dataRirht:rowData
        });
    };

    /**
     * 操作类型请求接口
     */
    requestAjax = () => {
        promiseAjax.get(`/cuser/findRegister`).then(
            res => {
                this.setState({
                    modalSelectData: res.data
                });
            }
        );
    };

    /**
     * 操作类型
     * @param e
     */
    handleRadio = (e) => {
        this.setState({
            loading: true,
            valueChange: e,
        });
        this.dataProcessing(e);
        e === "CHANGE" || e === "SHARE"
            ? this.setState({
                visableTable: true,
                value: e
            })
            : this.setState({
                visableTable: false
            });
    };

    handleOk = () => {
        this.setState({
            confirmLoading: true,
        });
        const radioValue = this.props.form.getFieldValue('oprType');
        const { record, selectedRowKeys } = this.state;
        if(!radioValue){
            message.error("请选择操作类型!");
            this.setState({
                confirmLoading: false
            });
            return
        }
        if(radioValue === "CHANGE"){
            if(selectedRowKeys.length <=0) {
                message.error("请选择移交人!");
                this.setState({
                    confirmLoading: false
                });
                return
            }
        }
        const ControlSettingVo = {
            controlTypeEnum: radioValue,
            nodeId: record.nodeId,
            toUserIds: selectedRowKeys,
            jobId: null
        };
        this.props.form.validateFieldsAndScroll(["oprType"],(err) => {
            if (!err) {
                promiseAjax.put( `/nodesowner`, ControlSettingVo ).then(
                    res => {
                        res.code === 200
                            ? message.success("操作成功!")
                            : message.error("操作失败!");
                        this.handleCancel();
                        this.search();
                        setTimeout(
                            () => this.expandedRowRender(null,record),100
                        )
                    }
                ).finally(
                    () => {
                        this.setState({
                            confirmLoading: false,
                        });
                    }
                );
            } else {
                this.setState({
                    confirmLoading: false,
                });
            }
        });
    };

    handleCancel = () => {
        this.props.form.resetFields(["oprType"]);
        this.setState({
            visible: false,
            visableTable: false,
        });
    };
    /**
     * (停止)接收任务推送
     * @param dataId
     */
    handlePush = (PushState, dataId) => {
        this.setState({
            tabLoading: true,
        });
        promiseAjax.post(`/nodes/taskpushstate?id=${dataId}&taskPushState=${PushState}`).then(rsp => {
            if (rsp.success) {
                const {dataSource} = this.state;
                dataSource.map((key, value)=> {
                    if (key.id === dataId) {
                        dataSource[value].taskPushState.name = rsp.data.taskPushState.name;
                        dataSource[value].taskPushState.code = rsp.data.taskPushState.code;
                    }
                });
                this.setState({
                    dataSource,
                });
                message.success('任务推送状态修改成功', 3);
            }
        }).finally(() => {
            this.setState({
                tabLoading: false,
            });
        });
    };

    /**
     * 停止当前任务
     * @param dataId
     */
    handleStopTask = (dataId)=> {
        this.setState({
            tabLoading: true,
        });
        promiseAjax.post(`/nodes/stoptask?id=${dataId}`).then(rsp => {
            if (rsp.success) {
                message.success('操作成功', 3);
            }
        }).finally(() => {
            this.setState({
                tabLoading: false,
            });
        });
    };

    /**
     * 删除元素
     */
    handleDelete = (sourceid)=> {
        this.setState({
            tabLoading: true,
        });
        promiseAjax.del(`/nodes/${sourceid}`).then(rsp => {
            if (rsp.success) {
                const {dataSource, total} = this.state
                this.setState({
                    dataSource: dataSource.filter(item => item.id !== sourceid),
                    total: total - 1
                });
                message.success('删除成功', 3);
            }
        }).finally(() => {
            this.setState({
                tabLoading: false,
            });
        });
    };

    /**
     * 查看元素
     */
    handleDetail = (sourceid)=> {
        browserHistory.push(`/dataTable/+detail/${sourceid}`);
    };

    search = (args) => {
        const {form} = this.props;
        const {pageNum, pageSize} = this.state;
        form.validateFieldsAndScroll((err, values) => {
            let params = {
                pageNo: pageNum,
                pageSize,
                ...values,
                ...args,
            };
            this.setState({
                tabLoading: true,
            });
            promiseAjax.get(`/nodes`, params).then(rsp => {
                if (rsp.success && rsp.data != undefined) {
                    this.setState({
                        pageNum: rsp.data.pageNo,
                        pageSize: rsp.data.pageSize,
                        total: parseInt(rsp.data.totalItems),
                        dataSource: rsp.data.result,
                    });
                } else {
                    this.setState({
                        dataSource: [],
                    });
                }
            }).finally(() => {
                this.setState({
                    tabLoading: false,
                });
            });
        })
    };

    /**
     * 查询
     */
    handleQuery = ()=> {
        this.setState({
            pageNum: 1,
        });
        const data = {
            pageNo: 1,
        }
        this.search(data);
    };

    /**
     * 重置
     * @param data
     */
    handleReset = ()=> {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
        });
        const data = {
            pageNo: 1,
        };
        this.search(data);
    };

    handlePageSizeChange = (pageSize) => {
        this.setState({
            pageNum: 1,
        });
        const data = {
            pageSize,
            pageNo: 1,
        };
        this.search(data);
    };

    handlePageNumChange = (value) => {
        const {pageSize} = this.state;
        this.setState({
            pageNum: value,
        });
        const data = {
            pageSize,
            pageNo: value,
        };
        this.search(data);
    };

    handleAddTask = () => {
        browserHistory.push('/nodeCluster/+add/NodeId');
    };

    /**
     * table额外展开行
     * @param boole
     * @param record
     */
    expandedRowRender = (boole,record) => {
        const { dataSource } = this.state;
        promiseAjax.get(`/nodesowner/findNodeOwner/${record.nodeId}`).then(
                res => {
                    dataSource.forEach(
                        (v,index) => {
                            if(v.nodeId === record.nodeId){
                                dataSource[index]["expandOwner"] = res.data.owner
                                    ? res.data.owner.name
                                    : "无";
                                dataSource[index]["expandShareOwner"] = res.data.shareOwner
                                    ? this.aryOper(res.data.shareOwner,"name").join(",")
                                    : "无"
                            }
                        }
                    );
                    this.setState({dataSource:dataSource});
                }
            );
    };

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {
            dataSource,
            total,
            pageNum,
            pageSize,
            tabLoading,
            visible,
            confirmLoading,
            visableTable,
            dicControlTypePlugins,
            data,
            loading,
            dataRirht,
            valueChange,
            selectedRowKeys,
            record,
        } =this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                if(valueChange === "SHARE"){
                    this.setState({
                        dataRirht:selectedRows,
                        selectedRowKeys
                    });
                }
            },
            onSelect : (record) => {
                if(valueChange === "CHANGE"){
                    let ary = [];
                    ary.push(record);
                    if(selectedRowKeys[0] !== record.id ){
                        this.setState({
                            selectedRowKeys: [record.id],
                            dataRirht: ary
                        });

                    }else{
                        this.setState({
                            selectedRowKeys: [],
                            dataRirht: []
                        });
                    }
                }
            }
        };
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
            },
        };
        const queryItemLayout = {
            xs: 12,
            md: 8,
            lg: 6,
        };
        return (
            <PageContent>
                <QueryBar>
                    <Form>
                        <Row>
                            <Col style={{width: '20%', float: 'left'}} >
                                <FormItem
                                    {...formItemLayout}
                                    label="节点ID">
                                    {getFieldDecorator('nodeId')(
                                        <Input placeholder="请填写节点ID" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col style={{width: '20%', float: 'left'}}>
                                <FormItem
                                    {...formItemLayout}
                                    label="IP地址">
                                    {getFieldDecorator('ipAddress')(
                                        <Input placeholder="请填写IP地址" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col style={{width: '20%', float: 'left'}}>
                                <FormItem
                                    {...formItemLayout}
                                    label="机器名称">
                                    {getFieldDecorator('machineName')(
                                        <Input placeholder="请填写机器名" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col style={{width: '20%', float: 'left'}}>
                                <FormItem
                                    {...formItemLayout}
                                    label="当前状态">
                                    {getFieldDecorator('state')(
                                        <Select placeholder="请选择状态" style={{ width: '100%' }}>
                                            <Option key="1" value="1">在线</Option>
                                            <Option key="-1" value="-1">离线</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>

                            <Col style={{textAlign:'right', width: '20%', float: 'left'}}>
                                <FormItem
                                    label=""
                                    colon={false}>
                                    <Button type="primary" onClick={() => this.handleAddTask()}
                                            style={{marginLeft: 10}}><FontIcon type="plus"/>新增</Button>
                                    <Button type="primary" onClick={()=>this.handleQuery(getFieldsValue())}
                                            style={{marginLeft: 10}}><FontIcon type="search"/>查询</Button>
                                    <Button type="ghost" onClick={() => this.handleReset()}
                                            style={{marginLeft: 10}}>重置</Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </QueryBar>

                <div style={{marginTop: '10px'}}>
                    <Table
                        dataSource={dataSource}
                        loading={tabLoading}
                        size="middle"
                        rowKey={(record) => record.id}
                        columns={this.columns}
                        pagination={false}
                        onExpand = { (expanded, record) => this.expandedRowRender(expanded, record) }
                        expandedRowRender={
                            record => <Row>
                                <Col span={10}>
                                    <a>节点所有者：{record.expandOwner}</a>
                                </Col>
                                <Col span={14}>
                                    <a>节点共享者: {record.expandShareOwner}</a>
                                </Col>
                            </Row>
                        }
                    />
                </div>
                <PaginationComponent
                    pageSize={pageSize}
                    pageNum={pageNum}
                    total={total}
                    onPageNumChange={this.handlePageNumChange}
                    onPageSizeChange={this.handlePageSizeChange}

                />

                <Modal
                    title={
                        <span>
                            <Col span={3}>
                                权限控制
                            </Col>
                        <span/>
                            <Col style={{color: "gray", fontSize: 6}}>
                                节点ID:{ record ? record.nodeId : null }
                            </Col>
                        </span>
                    }
                    visible={visible}
                    onOk={this.handleOk}
                    confirmLoading={confirmLoading}
                    onCancel={this.handleCancel}
                    width="60%"
                >
                    <Form>
                        <Row>
                            {
                                this.setTingsForm && this.setTingsForm.map(
                                    (v,k) =>
                                        <Col span={v.span} key={k}>
                                            <FormItem
                                                label={v.name}
                                                labelCol={{span:v.labelCol}}
                                                wrapperCol={{span:v.wrapperCol}}
                                                key={k}
                                            >

                                                {getFieldDecorator(v.key,{
                                                    initialValue: v.init,
                                                    rules: v.rule
                                                })(

                                                    v.type === "input"
                                                        ? <Input
                                                            style={{
                                                                border: "none",
                                                                boxShadow: "none"
                                                            }}
                                                            readOnly="readonly"
                                                        />
                                                        : v.type === "radio"
                                                        ? <Select placeholder="请选择" onChange={this.handleRadio}>
                                                            {
                                                                dicControlTypePlugins && dicControlTypePlugins.map(
                                                                    v => {
                                                                        return <Option
                                                                            key={v.alertType}
                                                                            value={v.alertType}
                                                                        >
                                                                            {v.fieldName}
                                                                        </Option>
                                                                    }
                                                                )
                                                            }
                                                        </Select>
                                                        : <p/>
                                                )}
                                            </FormItem>
                                        </Col>
                                )
                            }
                        </Row>
                    </Form>
                    {
                        visableTable
                            ? <Row style={{margin: "0 10px"}}>
                                <Col span={11} style={{marginRight: "6%"}}>
                                    <Table
                                        columns={this.columnsModal}
                                        dataSource={data}
                                        pagination={false}
                                        scroll={{ y: 300 }}
                                        rowKey={record => record.id}
                                        loading={loading}
                                        rowSelection={rowSelection}
                                    />
                                </Col>
                                <Col span={11}>
                                    <Table
                                        columns={this.columnsModal}
                                        dataSource={dataRirht}
                                        pagination={false}
                                        scroll={{ y: 300 }}
                                        rowKey={record => record.id}
                                        loading={loading}
                                    />
                                </Col>
                            </Row>
                            : null
                    }
                </Modal>
            </PageContent>
        )
    };
}
export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
