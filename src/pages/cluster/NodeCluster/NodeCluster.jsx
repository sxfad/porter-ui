/**
 * Created by lhyin on 2018/19/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, Select, message, Popconfirm} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import './style.less';
import {browserHistory} from 'react-router';
import connectComponent from '../../../redux/store/connectComponent';

const FormItem = Form.Item;
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
    }

    columns = [
        {
            title: '编号',
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
        },
        {
            title: '节点ID',
            render: (text, record) => {
                return (
                    record.nodeId
                );
            },
        },
        {
            title: '机器名称',
            render: (text, record) => {
                return (
                    record.machineName
                );
            },
        },
        {
            title: 'IP地址',
            render: (text, record) => {
                return (
                    record.ipAddress
                );
            },
        },
        {
            title: '心跳时间',
            render: (text, record) => {
                return (
                    record.heartBeatTime
                );
            },
        },
        {
            title: '进程号',
            render: (text, record) => {
                return (
                    record.pidNumber
                );
            },
        },
        {
            title: '状态',
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
            title: '任务推送状态',
            render: (text, record) => {
                return (
                    record.taskPushState.name
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => {
                if (record.taskPushState.code === 'SUSPEND') {
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

    componentDidMount() {
        this.search();
    }

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
                console.log(rsp);
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
            console.log(values);
            let params = {
                pageNo: pageNum,
                pageSize,
                ...values,
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
        }
        this.search(data);
    }

    handlePageSizeChange = (pageSize) => {
        this.setState({
            pageNum: 1,
        });
        const data = {
            pageSize,
            pageNo: 1,
        };
        this.search(data);
    }

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
    }

    handleAddTask = () => {
        browserHistory.push('/nodeCluster/+add/NodeId');
    }

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {dataSource, total, pageNum, pageSize, tabLoading} =this.state;
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
                            <Col {...queryItemLayout}>
                                <FormItem
                                    {...formItemLayout}
                                    label="IP地址">
                                    {getFieldDecorator('ipAddress')(
                                        <Input placeholder="请填写IP地址" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col {...queryItemLayout}>
                                <FormItem
                                    {...formItemLayout}
                                    label="机器名称">
                                    {getFieldDecorator('machineName')(
                                        <Input placeholder="请填写机器名" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={5}>
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

                            <Col span={7} style={{textAlign:'right'}}>
                                <FormItem
                                    label=""
                                    colon={false}>
                                    <Button type="primary" onClick={() => this.handleAddTask()}
                                            style={{marginLeft: 15}}><FontIcon type="plus"/>新增</Button>
                                    <Button type="primary" onClick={()=>this.handleQuery(getFieldsValue())}
                                            style={{marginLeft: 15}}><FontIcon type="search"/>查询</Button>
                                    <Button type="ghost" onClick={() => this.handleReset()}
                                            style={{marginLeft: 15}}>重置</Button>
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
                    />
                </div>
                <PaginationComponent
                    pageSize={pageSize}
                    pageNum={pageNum}
                    total={total}
                    onPageNumChange={this.handlePageNumChange}
                    onPageSizeChange={this.handlePageSizeChange}

                />
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
