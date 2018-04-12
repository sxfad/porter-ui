/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, Modal, message, DatePicker} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import {formatDefaultTime} from '../common/getTime';
import connectComponent from '../../redux/store/connectComponent';
import SelectTask from './SelectTask';
import Echarts from './Echarts';
import './style.less';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
export const PAGE_ROUTE = '/taskMonitor';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        dataSource: [],
        echartsVisible: false,
        tabLoading: false,
        selectedTask: [],
        selectTaskVisible: false,
    }

    columns = [
        {
            title: '编号',
            render: (text, record, index) => (index + 1),
        },
        {
            title: '任务ID',
            render: (text, record) => {
                return (
                    record.jobId
                );
            },
        },
        {
            title: '任务泳道',
            render: (text, record) => {
                return (
                    record.swimlaneId
                );
            },
        },
        {
            title: '分配节点',
            render: (text, record) => {
                return (
                    record.nodeIdIp
                );
            },
        },
        {
            title: '数据表',
            render: (text, record) => {
                return (
                    record.schemaTable
                );
            },
        },
        // {
        //     title: '注册时间',
        //     render: (text, record) => {
        //         return (
        //             record.registerTime
        //         );
        //     },
        // },
        {
            title: '最后心跳时间',
            render: (text, record) => {
                return (
                    formatDefaultTime(record.heartBeatDate)
                );
            },
        },
        // {
        //     title: '处理进度',
        //     render: (text, record) => {
        //         return (
        //             record.disposeSchedule
        //         );
        //     },
        // },
        {
            title: '告警次数',
            render: (text, record) => {
                return (
                    <span className="text-warning">{record.alarmNumber}</span>
                );
            },
        },
        {
            title: '插入成功',
            render: (text, record) => {
                return (
                    <span className="text-green">{record.insertSuccess}</span>
                );
            },
        },
        {
            title: '插入失败',
            render: (text, record) => {
                return (
                    <span className="text-error">{record.insertFailure}</span>
                );
            },
        },
        {
            title: '更新成功',
            render: (text, record) => {
                return (
                    <span className="text-green">{record.updateSuccess}</span>
                );
            },
        },
        {
            title: '更新失败',
            render: (text, record) => {
                return (
                    <span className="text-error">{record.updateFailure}</span>
                );
            },
        },
        {
            title: '删除成功',
            render: (text, record) => {
                return (
                    <span className="text-green">{record.deleteSuccess}</span>
                );
            },
        },
        {
            title: '删除失败',
            render: (text, record) => {
                return (
                    <span className="text-error">{record.deleteFailure}</span>
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <span>
                        <a onClick={() => this.handleEcharts(record.id)}>查看详情</a>
                    </span>
                )
            }
        },
    ];

    renderNumber = (record)=> {
        console.log(record);
        return (
            <div className="monitor-data">
                <span>处理进度: <a className="text-gray">{record.disposeSchedule}</a></span>
                <span className="divider"/>
                <span>注册时间: <a className="text-gray">{formatDefaultTime(record.registerTime)}</a></span>
            </div>
        )
    };

// <span>告警次数: <b className="text-warning">{record.alarmNumber}</b></span>
// <span className="divider"/>
// <span>插入成功次数: <b className="text-default">{record.insertSuccess}</b></span>
// <span>插入失败次数: <b className="text-error">{record.insertFailure}</b></span>
// <span className="divider"/>
// <span>更新成功次数: <b className="text-default">{record.updateSuccess}</b></span>
// <span>更新失败次数: <b className="text-error">{record.updateFailure}</b></span>
// <span className="divider"/>
// <span>删除成功次数: <b className="text-default">{record.deleteSuccess}</b></span>
// <span>删除失败次数: <b className="text-error">{record.deleteFailure}</b></span>

    componentDidMount() {
        this.search();
    }

    handleEcharts = (dataId) => {
        this.setState({
            echartsVisible: true,
        });
    };

    search = (args) => {
        const {form: {getFieldValue}} = this.props;
        let jobId = getFieldValue('jobId');
        let times = getFieldValue('times');
        let endTimeStr = '',
            startTimeStr = '';
        if (times != undefined) {
            endTimeStr = moment(times[1]).format('YYYY-MM-DD HH:mm:ss');
            startTimeStr = moment(times[0]).format('YYYY-MM-DD HH:mm:ss');
        }
        let params = {
            jobId,
            heartBeatBeginDate: startTimeStr,
            heartBeatEndDate: endTimeStr,
            ...args,
        };
        this.setState({
            tabLoading: true,
        });
        promiseAjax.get(`/mrjobtasksschedule`, params).then(rsp => {
            if (rsp.success && rsp.data != undefined) {
                this.setState({
                    dataSource: rsp.data,
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
    handleQuery = ()=> {
        this.search();
    };

    /**
     * 重置
     * @param data
     */
    handleReset = ()=> {
        this.props.form.resetFields();
        this.setState({
            selectedTask: [],
        });
        this.search();
    }

    handleCancel = (e) => {
        this.setState({
            echartsVisible: false,
        });
    };

    handleOk = (e) => {
        this.setState({
            echartsVisible: false,
        });
    };

    handleSelectTaskOk = () => {
        const {selectedTask} =this.state;
        const {setFieldsValue} = this.props.form;
        setFieldsValue({jobName: selectedTask[0].jobName, jobId: selectedTask[0].id});
        this.setState({
            selectTaskVisible: false,
        });
    }

    handleSelectTaskCancel = () => {
        this.setState({
            selectTaskVisible: false,
        });
    }

    /**
     * 选择任务
     */
    changeTask = (dataSource) => {
        this.setState({
            selectedTask: dataSource,
        });
    };

    /**
     * 点击 input 选择任务
     */
    selectTask = () => {
        this.setState({
            selectTaskVisible: true,
        })
    };

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {dataSource, tabLoading, echartsVisible, selectTaskVisible} =this.state;
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
                                    label="任务名称">
                                    {getFieldDecorator('jobName')(
                                        <Input placeholder="请选择任务" onClick={() => this.selectTask()}
                                               style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col {...queryItemLayout}>
                                <FormItem
                                    {...formItemLayout} label="心跳时间">
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
                            <Col span={1}>
                                <FormItem>
                                    {getFieldDecorator('jobId')(
                                        <Input type="hidden"/>
                                    )}
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
                        expandedRowRender={record => this.renderNumber(record)}
                        defaultExpandAllRows={true}
                    />
                </div>
                {
                    echartsVisible ? <Modal
                        title="泳道实时监控图"
                        visible={this.state.echartsVisible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        width='70%'
                    >
                        <Echarts/>
                    </Modal> : null
                }
                {
                    selectTaskVisible ? <Modal
                        title="选择任务"
                        visible={this.state.selectTaskVisible}
                        onOk={this.handleSelectTaskOk}
                        onCancel={this.handleSelectTaskCancel}
                        width='70%'
                        style={{ top: 30 }}
                    >
                        <SelectTask changeTask={this.changeTask.bind(this)}/>
                    </Modal> : null
                }
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
