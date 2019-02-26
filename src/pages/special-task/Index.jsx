/**
 * Created by lhyin on 2017/12/5.
 */
import React, {Component} from 'react';
import {browserHistory} from 'react-router';
import {Form, Input, Button, Table, Row, Col, DatePicker, message, Popconfirm, Select} from 'antd';
import {PageContent, PaginationComponent, QueryBar, FontIcon} from 'sx-ui/antd';
import moment from 'moment';
import {promiseAjax} from 'sx-ui';
import './style.less';
import {formatDefaultTime} from '../common/getTime';
import connectComponent from '../../redux/store/connectComponent';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const {Option} = Select;

export const PAGE_ROUTE = '/specialTask';

@Form.create()
export class LayoutComponent extends Component {
    state = {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        application: [],
        startTimeStr: '', // 开始时间
        endTimeStr: '',   // 结束时间(默认当前时间)
        endTime: Date(),
        dataSource: [],
        tabLoading: false,
        visible: false,
        applicationName: '',
    };

    columns = [
        {
            title: '序号',
            key: '__num',
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
        },
        {
            title: '任务ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '任务名称',
            dataIndex: 'jobName',
            key: 'jobName',
            width: 200,
        },
        {
            title: '来源数据-消费插件',
            dataIndex: 'sourceConsumeAdt.name',
            key: 'sourceConsumeAdt.name',
        },
        {
            title: '来源数据-消费转换插件',
            dataIndex: 'sourceConvertAdt.name',
            key: 'sourceConvertAdt.name',
        },
        {
            title: '目标数据-载入插件',
            dataIndex: 'targetLoadAdt.name',
            key: 'targetLoadAdt.name',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => {
                return (
                    formatDefaultTime(text)
                );
            },
        },
        {
            title: '状态',
            dataIndex: 'jobState.name',
            key: 'jobState.name',
        },
        {
            title: '操作',
            key: 'operator',
            render: (text, record) => {
                if (record.jobState.name === '新建') {
                    return (
                        <span>
                            <a onClick={() => this.handleUpdate(record.id)}>编辑</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleStop('WORKING', record.id)}>开始</a>
                            <span className="ant-divider"/>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                                <a>删除</a>
                            </Popconfirm>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    );
                } else if (record.jobState.name === '工作中') {
                    return (
                        <span>
                            <a onClick={() => this.handleStop('STOPPED', record.id)}>停止</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    );
                } else if (record.jobState.name === '已停止') {
                    return (
                        <span>
                            <a onClick={() => this.handleUpdate(record.id)}>编辑</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleStop('WORKING', record.id)}>开始</a>
                            <span className="ant-divider"/>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                                <a>删除</a>
                            </Popconfirm>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    );
                }
            },
        },
    ];

    /**
     * 编辑任务
     * @param id
     */
    handleUpdate = (id) => {
        browserHistory.push(`/specialTask/+edit/${id}`);
    };

    /**
     * 查看元素
     */
    handleDetail = (id) => {
        browserHistory.push(`/specialTask/+detail/${id}`);
    };

    /**
     * 删除
     * @param id
     */
    handleDelete = (id) => {
        this.setState({
            tabLoading: true,
        });
        promiseAjax.del(`/jobtasks/${id}`).then(rsp => {
            if (rsp.success) {
                const {dataSource, total} = this.state;
                this.setState({
                    dataSource: dataSource.filter(item => item.id !== id),
                    total: total - 1,
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
     * 开始任务
     * @param id
     */
    handleStop = (type, id) => {
        this.setState({
            tabLoading: true,
        });
        let typeStr = '';
        if (type === 'STOPPED') {
            typeStr = '已停止';
        } else {
            typeStr = '工作中';
        }
        promiseAjax.put(`/jobtasks/${id}?taskStatusType=${type}`).then(rsp => {
            if (rsp.success) {
                const {dataSource} = this.state;
                dataSource.forEach((key, value) => {
                    if (key.id === id) {
                        dataSource[value].jobState.name = typeStr;
                        dataSource[value].jobState.code = type;
                    }
                });
                this.setState({
                    dataSource,
                });
                message.success('操作成功', 3);
            }
        }).finally(() => {
            this.setState({
                tabLoading: false,
            });
        });
    };

    componentDidMount() {
        this.search();
        this.st = setInterval(this.search, 5 * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.st);
    }

    search = (args) => {
        const {form: {getFieldValue}} = this.props;
        const jobName = getFieldValue('jobName');
        const jobId = getFieldValue('jobId');
        const times = getFieldValue('times');
        const jobState = getFieldValue('jobState');

        let endTimeStr = '';
        let startTimeStr = '';
        if (times) {
            if (times.length > 0) {
                endTimeStr = moment(times[1]).format('YYYY-MM-DD HH:mm:ss');
                startTimeStr = moment(times[0]).format('YYYY-MM-DD HH:mm:ss');
            }
        }
        const {pageNum, pageSize} = this.state;

        let params = {
            jobId,
            jobName,
            jobState,
            jobType: 2,
            pageNo: pageNum,
            pageSize,
            beginTime: startTimeStr,
            endTime: endTimeStr,
            ...args,
        };
        this.setState({
            tabLoading: true,
        });
        promiseAjax.get('/jobtasks/page', params).then(rsp => {
            if (rsp.success && rsp.data) {
                this.setState({
                    pageNum: rsp.data.pageNo,
                    pageSize: rsp.data.pageSize,
                    total: window.parseInt(rsp.data.totalItems),
                    dataSource: rsp.data.result,
                    startTimeStr,
                    endTimeStr,
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
    };

    /**
     * 查询
     */
    handleQuery = () => {
        this.setState({
            pageNum: 1,
        });
        const data = {
            pageNo: 1,
        };
        this.search(data);
    };

    /**
     * 重置
     * @param data
     */
    handleReset = () => {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
        });
        const data = {
            pageNo: 1,
        };
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

    /**
     * 设置时间
     */
    onOk = (value) => {
        console.log(value);
        this.setState({
            startTimeStr: moment(value[0]).format('YYYY-MM-DD HH:mm:ss'),
            endTimeStr: moment(value[1]).format('YYYY-MM-DD HH:mm:ss'),
        });
    };

    handleAddTask = () => {
        browserHistory.push('/specialTask/+edit/:id');
    };

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {dataSource, total, pageNum, pageSize, tabLoading} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 7},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 17},
            },
        };
        return (
            <PageContent className="special-task">
                <QueryBar>
                    <Form>
                        <Row>
                            <Col span={4}>
                                <FormItem
                                    {...formItemLayout}
                                    label="任务ID">
                                    {getFieldDecorator('jobId')(
                                        <Input placeholder="请填写任务Id" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={4} offset={1}>
                                <FormItem
                                    {...formItemLayout}
                                    label="任务名称">
                                    {getFieldDecorator('jobName')(
                                        <Input placeholder="请填写任务名称" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={4} offset={1}>
                                <FormItem
                                    {...formItemLayout}
                                    label="状态">
                                    {getFieldDecorator('jobState')(
                                        <Select placeholder="请选择状态">
                                            <Option value="NEW">新建</Option>
                                            <Option value="STOPPED">已停止</Option>
                                            <Option value="WORKING">工作中</Option>
                                            <Option value="DELETED">已删除</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={4} offset={1}>
                                <FormItem
                                    {...formItemLayout} label="创建时间">
                                    {getFieldDecorator('times', {})(
                                        <RangePicker
                                            showTime
                                            style={{width: '100%'}}
                                            format="YYYY-MM-DD HH:mm"
                                            placeholder={['开始时间', '结束时间']}
                                            onOk={this.onOk}
                                        />
                                    )}

                                </FormItem>
                            </Col>
                            <Col span={5} style={{textAlign: 'right'}}>
                                <FormItem
                                    label=""
                                    colon={false}>
                                    <Button
                                        type="primary"
                                        onClick={() => this.handleAddTask()}
                                    >
                                        <FontIcon type="plus"/>新增
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() => this.handleQuery(getFieldsValue())}
                                        style={{marginLeft: 15}}
                                    >
                                        <FontIcon type="search"/>查询
                                    </Button>
                                    <Button
                                        type="ghost" onClick={() => this.handleReset()}
                                        style={{marginLeft: 15}}
                                    >
                                        重置
                                    </Button>
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
        );
    }
}

export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
