/**
 * Created by lhyin on 2018/20/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, DatePicker, Select, Popconfirm} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import {getBeforeHoursTime, formatDefaultTime} from '../common/getTime';
import moment from 'moment';
import './style.less';
import connectComponent from '../../redux/store/connectComponent';

export const PAGE_ROUTE = '/selectNode';
const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
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
                    record.taskPushState && record.taskPushState.name
                );
            },
        },
    ];

    componentDidMount() {
        this.search();
    }

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
        }
        this.search(data);
    }

    /**
     * 设置时间
     */
    onOk = (value)=> {
        this.setState({
            startTimeStr: moment(value[0]).format('YYYY-MM-DD HH:mm:ss'),
            endTimeStr: moment(value[1]).format('YYYY-MM-DD HH:mm:ss'),
        });
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
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.props.changeNode(selectedRows);
            },
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
                            <Col span={6}>
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

                            <Col span={6} style={{textAlign:'right'}}>
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
                        rowSelection={rowSelection}
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
