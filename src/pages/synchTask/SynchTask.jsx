/**
 * Created by lhyin on 2017/12/5.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Select, Row, Col, DatePicker, message, Popconfirm} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import moment from 'moment';
import {promiseAjax} from 'sx-ui';
import './style.less';
import {formatDefaultTime} from '../common/getTime';
import {browserHistory} from 'react-router';
import connectComponent from '../../redux/store/connectComponent';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
export const PAGE_ROUTE = '/synchTask';
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
        applicationName: '',
    }

    columns = [
        {
            title: '序号',
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
        },
        {
            title: '任务ID',
            render: (text, record) => {
                return (
                    record.id
                );
            },
        },
        {
            title: '任务名称',
            render: (text, record) => {
                return (
                    record.jobName
                );
            },
        },
        {
            title: '来源数据-消费插件',
            render: (text, record) => {
                return (
                    record.sourceConsumeAdt.name
                );
            },
        },
        {
            title: '来源数据-消费转换插件',
            render: (text, record) => {
                return (
                    record.sourceConvertAdt.name
                );
            },
        },
        {
            title: '目标数据-载入插件',
            render: (text, record) => {
                return (
                    record.targetLoadAdt.name
                );
            },
        },
        {
            title: '创建时间',
            render: (text, record) => {
                return (
                    formatDefaultTime(record.createTime)
                );
            },
        },
        {
            title: '状态',
            render: (text, record) => {
                return (
                    record.jobState.name
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => {
                if (record.jobState.name === '新建') {
                    return (
                        <span>
                            <a onClick={() => this.handleUpdate(record.id)}>编辑</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleStop('WORKING',record.id)}>开始</a>
                            <span className="ant-divider"/>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                              <a href="#">删除</a>
                            </Popconfirm>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    )
                } else if (record.jobState.name === '工作中') {
                    return (
                        <span>
                            <a onClick={() => this.handleStop('STOPPED',record.id)}>停止</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    )
                } else if (record.jobState.name === '已停止') {
                    return (
                        <span>
                            <a onClick={() => this.handleUpdate(record.id)}>编辑</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleStop('WORKING',record.id)}>开始</a>
                            <span className="ant-divider"/>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                              <a href="#">删除</a>
                            </Popconfirm>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    )
                }
            },
        },
    ];

    /**
     * 编辑任务
     * @param id
     */
    handleUpdate = (id) => {
        browserHistory.push(`/synchtask/+add/${id}`);
    }

    /**
     * 查看元素
     */
    handleDetail = (id)=> {
        browserHistory.push(`/synchtask/+detail/${id}`);
    };

    /**
     * 删除
     * @param id
     */
    handleDelete = (id)=> {
        this.setState({
            tabLoading: true,
        });
        promiseAjax.del(`/jobtasks/${id}`).then(rsp => {
            if (rsp.success) {
                const {dataSource, total} = this.state
                this.setState({
                    dataSource: dataSource.filter(item => item.id !== id),
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
     * 开始任务
     * @param id
     */
    handleStop = (type, id)=> {
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
                console.log(rsp);
                console.log(dataSource);
                const {dataSource} = this.state;
                console.log(dataSource);
                dataSource.map((key, value)=> {
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
    }

    search = () => {
        const {form: {getFieldValue}} = this.props;
        let jobName = getFieldValue('jobName');
        let times = getFieldValue('times');

        let endTimeStr = '',
            startTimeStr = '';
        if (times != undefined) {
            if (times.length > 0) {
                endTimeStr = moment(times[1]).format('YYYY-MM-DD HH:mm:ss');
                startTimeStr = moment(times[0]).format('YYYY-MM-DD HH:mm:ss');
            }
        }
        const {pageNum, pageSize} = this.state;

        let params = {
            jobName,
            pageNo: pageNum,
            pageSize,
            beginTime: startTimeStr,
            endTime: endTimeStr,
        };
        this.setState({
            tabLoading: true,
        });
        promiseAjax.get(`/jobtasks`, params).then(rsp => {
            if (rsp.success && rsp.data != undefined) {
                this.setState({
                    pageNum: rsp.data.pageNo,
                    pageSize: rsp.data.pageSize,
                    total: parseInt(rsp.data.totalItems),
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
    }

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

    /**
     * 设置时间
     */
    onOk = (value)=> {
        console.log(value);
        this.setState({
            startTimeStr: moment(value[0]).format('YYYY-MM-DD HH:mm:ss'),
            endTimeStr: moment(value[1]).format('YYYY-MM-DD HH:mm:ss'),
        });
    };

    handleAddTask = () => {
        browserHistory.push('/synchtask/+add/TaskId');
    };

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {dataSource, total, pageNum, pageSize, tabLoading, visible, startTimeStr, endTimeStr, applicationName} =this.state;
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
                                    label="任务名称">
                                    {getFieldDecorator('jobName')(
                                        <Input placeholder="请填写任务名称" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout} label="创建时间">
                                    {getFieldDecorator('times', {})(
                                        <RangePicker
                                            showTime
                                            style={{width: '100%'}}
                                            format="YYYY-MM-DD HH:mm"
                                            placeholder={['Start Time', 'End Time']}
                                            onOk={this.onOk}
                                        />
                                    )}

                                </FormItem>
                            </Col>
                            <Col span={7} style={{textAlign:'right'}}>
                                <FormItem
                                    label=""
                                    colon={false}>
                                    <Button type="primary" onClick={() => this.handleAddTask()}
                                            style={{marginLeft: 15}}><FontIcon type="plus"/>新增任务</Button>
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
    }
    ;
}
export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
