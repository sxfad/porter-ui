/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, Select, message, Popconfirm} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import {browserHistory} from 'react-router';
import connectComponent from '../../redux/store/connectComponent';

const FormItem = Form.Item;
export const PAGE_ROUTE = '/taskMonitor';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        application: [],
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
            title: '机器名',
            render: (text, record) => {
                return (
                    record.computerName
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
                    record.heartBeatDate
                );
            },
        },
        {
            title: '进程号',
            render: (text, record) => {
                return (
                    record.processNumber
                );
            },
        },
        {
            title: '任务',
            render: (text, record) => {
                return (
                    record.jobIdJson
                );
            },
        },
        {
            title: '节点健康级别',
            render: (text, record) => {
                return (
                    record.healthLevel.name
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <span>
                        <a onClick={() => this.handlePush('WORKING', record.id)}>查看详情</a>
                    </span>
                )
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
            let params = {
                pageNo: pageNum,
                pageSize,
                ...values,
                ...args,
            };
            this.setState({
                tabLoading: true,
            });
            promiseAjax.get(`/mrnodesschedule`, params).then(rsp => {
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
        console.log('value', pageSize);
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
        console.log('value', value);

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
                                    {getFieldDecorator('computerName')(
                                        <Input placeholder="请填写机器名" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={5} style={{textAlign:'right'}}>
                                <FormItem
                                    label=""
                                    colon={false}>
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
