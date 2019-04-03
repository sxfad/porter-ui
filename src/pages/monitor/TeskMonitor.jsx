/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, Modal, message, DatePicker} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import uuid from '../../../node_modules/uuid/v4';
import {promiseAjax} from 'sx-ui';
import moment from 'moment';
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
        jobmonitor: [],
    }

    columns = [
        {
            title: '编号',
            render: (text, record, index) => (index + 1),
            key: uuid()
        },
        {
            title: '任务ID',
            render: (text, record) => {
                return (
                    record.jobId
                );
            },
            key: uuid()
        },
        {
            title: '任务泳道',
            render: (text, record) => {
                return (
                    record.swimlaneId
                );
            },
            key: uuid()
        },
        {
            title: '分配节点',
            render: (text, record) => {
                return (
                    record.nodeIdIp
                );
            },
            key: uuid()
        },
        {
            title: '数据表',
            render: (text, record) => {
                return (
                    record.schemaTable
                );
            },
            key: uuid()
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
            key: uuid()
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
            key: uuid()
        },
        {
            title: '插入成功(本日增量)',
            render: (text, record) => {
                console.log(record);
                return (
                    <span className="text-green">{record.insertSuccess}({record.insertSuccessByDay}↑)</span>
                );
            },
            key: uuid()
        },
        {
            title: '插入失败(本日增量)',
            render: (text, record) => {
                return (
                    <span className="text-error">{record.insertFailure}({record.insertFailureByDay}↓)</span>
                );
            },
            key: uuid()
        },
        {
            title: '更新成功(本日增量)',
            render: (text, record) => {
                return (
                    <span className="text-green">{record.updateSuccess}({record.updateSuccessByDay}↑)</span>
                );
            },
            key: uuid()
        },
        {
            title: '更新失败(本日增量)',
            render: (text, record) => {
                return (
                    <span className="text-error">{record.updateFailure}({record.updateFailureByDay}↓)</span>
                );
            },
            key: uuid()
        },
        {
            title: '删除成功(本日增量)',
            render: (text, record) => {
                return (
                    <span className="text-green">{record.deleteSuccess}({record.deleteSuccessByDay}↑)</span>
                );
            },
            key: uuid()
        },
        {
            title: '删除失败(本日增量)',
            render: (text, record) => {
                return (
                    <span className="text-error">{record.deleteFailure}({record.deleteFailureByDay}↓)</span>
                );
            },
            key: uuid()
        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <span>
                        <a onClick={() => this.handleEcharts(record)}>详情</a>
                    </span>
                );
            },
            width: 100,
            key: uuid()
        },
    ];

    renderNumber = (record)=> {
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

    /**
     *  查看泳道详情
     * @param data
     */
    handleEcharts = (data) => {
        this.setState({
            jobmonitor: data,
            echartsVisible: true,
        });
    };

    search = (args) => {
        const {form: {getFieldValue}} = this.props;
        let jobId = getFieldValue('jobId');
        // let times = getFieldValue('times');
        // let endTimeStr = '',
        //     startTimeStr = '';
        // if (times != undefined) {
        //     endTimeStr = moment(times[1]).format('YYYY-MM-DD HH:mm:ss');
        //     startTimeStr = moment(times[0]).format('YYYY-MM-DD HH:mm:ss');
        // }
        let params = {
            jobId,
            // heartBeatBeginDate: startTimeStr,
            // heartBeatEndDate: endTimeStr,
            ...args,
        };
        this.setState({
            tabLoading: true,
        });
        promiseAjax.get(`/mrjobtasksschedule/list`, params).then(rsp => {
            if (rsp.success && rsp.data != undefined) {
                console.log(rsp);
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
        const {selectedTask} = this.state;
        const {setFieldsValue} = this.props.form;
        setFieldsValue({jobName: selectedTask[0].jobName, jobId: selectedTask[0].id});
        this.setState({
            selectTaskVisible: false,
        });
        this.search();
    };

    handleSelectTaskCancel = () => {
        this.setState({
            selectTaskVisible: false,
        });
    };

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
        const {dataSource, tabLoading, echartsVisible, selectTaskVisible, jobmonitor} =this.state;
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
                            <Col span={3} style={{textAlign:'right'}}>
                                <FormItem label="" colon={false}>
                                    <Button type="primary" onClick={()=>this.handleQuery(getFieldsValue())}
                                            style={{marginLeft: 15}}><FontIcon type="fa-refresh"/> 刷新</Button>
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
                        columns={this.columns}
                        pagination={false}
                        expandedRowRender={record => this.renderNumber(record)}
                        defaultExpandAllRows={true}
                    />
                </div>
                <div>
                {
                    echartsVisible ? <Modal
                        title="泳道实时监控图"
                        visible={this.state.echartsVisible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        className="chartRoot"
                        width='70%'
                    >
                        <Echarts jobmonitor={jobmonitor}/>
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
                </div>
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
