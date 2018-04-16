/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, DatePicker} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import moment from 'moment';
import {formatDefaultTime} from '../common/getTime';
import connectComponent from '../../redux/store/connectComponent';
import Echarts from './Echarts';
import './style.less';

const FormItem = Form.Item;
const {RangePicker} = DatePicker;
export const PAGE_ROUTE = '/logMonitor';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        application: [],
        dataSource: [],
        tabLoading: false,
        startTimeStr: '',
        endTimeStr: '',
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
            title: '任务名称',
            render: (text, record) => {
                return (
                    record.jobName
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
            title: 'IP地址',
            render: (text, record) => {
                return (
                    record.ipAdress
                );
            },
        },
        {
            title: '日志记录时间',
            render: (text, record) => {
                return (
                    formatDefaultTime(record.logDate)
                );
            },
        },

        {
            title: '标题',
            render: (text, record) => {
                return (
                    record.logTitle
                );
            },
        },
        {
            title: '日志内容',
            width: '480px',
            render: (text, record) => {
                return (
                    <span className="text-gray">{record.logContent}</span>
                );
            },
        },
    ];

    componentDidMount() {
        this.search();
    }

    search = (args) => {
        const {form, form: {getFieldValue}} = this.props;
        const {pageNum, pageSize} = this.state;
        let times = getFieldValue('times');
        let endTimeStr = '',
            startTimeStr = '';
        if (times != undefined) {
            if (times.length > 0) {
                endTimeStr = moment(times[1]).format('YYYY-MM-DD HH:mm:ss');
                startTimeStr = moment(times[0]).format('YYYY-MM-DD HH:mm:ss');
            }
        }
        form.validateFieldsAndScroll((err, values) => {
            let params = {
                pageNo: pageNum,
                pageSize,
                ...values,
                ...args,
                beginTime: startTimeStr,
                endTime: endTimeStr,
            };
            this.setState({
                tabLoading: true,
            });
            promiseAjax.get(`/mrlogmonitor`, params).then(rsp => {
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

    /**
     * 设置时间
     */
    onOk = (value)=> {
        this.setState({
            startTimeStr: moment(value[0]).format('YYYY-MM-DD HH:mm:ss'),
            endTimeStr: moment(value[1]).format('YYYY-MM-DD HH:mm:ss'),
        });
    };

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
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout} label="日志记录时间">
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
