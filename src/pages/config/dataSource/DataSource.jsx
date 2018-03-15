/**
 * Created by lhyin on 2017/12/5.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Select, Row, Col, DatePicker} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import moment from 'moment';
import {getBeforeHoursTime, formatMinuteTime} from '../../common/getTime';
import {browserHistory} from 'react-router';
import connectComponent from '../../../redux/store/connectComponent';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
export const PAGE_ROUTE = '/dataSource';
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
        dataSource: [
            // {
            //     "id": "8",
            //     "name1": "string",
            //     "dataType": {
            //         "code": "ZOOKEEPER",
            //         "name": "zookeeper"
            //     },
            //     "creater": null,
            //     "createTime": 1521013899000,
            //     "state": null,
            //     "iscancel": null,
            //     "remark": null,
            //     "plugins": []
            // },
            // {
            //     "id": "15",
            //     "name1": "string",
            //     "dataType": {
            //         "code": "ZOOKEEPER",
            //         "name": "zookeeper"
            //     },
            //     "creater": null,
            //     "createTime": 1521013899000,
            //     "state": null,
            //     "iscancel": null,
            //     "remark": null,
            //     "plugins": []
            // },
            // {
            //     "id": "16",
            //     "name1": "kafka",
            //     "dataType": {
            //         "code": "KAFKA",
            //         "name": "kafka"
            //     },
            //     "creater": null,
            //     "createTime": 1521013899000,
            //     "state": null,
            //     "iscancel": null,
            //     "remark": null,
            //     "plugins": []
            // },
            // {
            //     "id": "7",
            //     "name1": "string",
            //     "dataType": {
            //         "code": "ZOOKEEPER",
            //         "name": "zookeeper"
            //     },
            //     "creater": null,
            //     "createTime": 1520996292000,
            //     "state": null,
            //     "iscancel": null,
            //     "remark": null,
            //     "plugins": []
            // },
            // {
            //     "id": "6",
            //     "name1": "string",
            //     "dataType": {
            //         "code": "ZOOKEEPER",
            //         "name": "zookeeper"
            //     },
            //     "creater": null,
            //     "createTime": 1520994403000,
            //     "state": null,
            //     "iscancel": null,
            //     "remark": null,
            //     "plugins": []
            // },
            // {
            //     "id": "5",
            //     "name1": "string",
            //     "dataType": {
            //         "code": "KAFKA",
            //         "name": "kafka"
            //     },
            //     "creater": null,
            //     "createTime": 1520923103000,
            //     "state": null,
            //     "iscancel": null,
            //     "remark": null,
            //     "plugins": []
            // },
            // {
            //     "id": "4",
            //     "name1": "string",
            //     "dataType": {
            //         "code": "KAFKA",
            //         "name": "kafka"
            //     },
            //     "creater": null,
            //     "createTime": 1520923002000,
            //     "state": null,
            //     "iscancel": null,
            //     "remark": null,
            //     "plugins": []
            // },
            // {
            //     "id": "3",
            //     "name1": "oracle",
            //     "dataType": {
            //         "code": "ZOOKEEPER",
            //         "name": "zookeeper"
            //     },
            //     "creater": null,
            //     "createTime": 1520922484000,
            //     "state": null,
            //     "iscancel": null,
            //     "remark": null,
            //     "plugins": []
            // }
        ],
        tabLoading: false,
    }

    columns = [
        {
            title: '编号',
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 2) * this.state.pageSize),
        },
        {
            title: '数据源名称',
            render: (text, record) => {
                return (
                    record.name
                );
            },
        },
        {
            title: '类型',
            render: (text, record) => {
                return (
                    record.dataType.name
                );
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
        {
            title: '操作',
            key: 'operator',
            render: (text, record) => {
                const items = [
                    {
                        label: '查看',
                        onClick: () => this.handleDetail(record),
                    },
                    {
                        label: '删除',
                        onClick: () => this.deleteItem(record),
                    },
                ];
                return (<Operator items={items}/>);
            },
        },
    ];


    componentWillMount() {
        const {endTime} = this.state;
        let stratTime = getBeforeHoursTime(endTime, 72);  //根据结束时间得到开始时间
        let endTimeStr = moment(endTime).format('YYYY-MM-DD HH:mm:ss');
        let startTimeStr = moment(stratTime).format('YYYY-MM-DD HH:mm:ss');
        this.setState({
            startTimeStr,
            endTimeStr,
        });
        const searchData = {
            beginTime: startTimeStr,
            endTime: endTimeStr,
        };
        this.search(searchData);
    }

    search = (args) => {
        const {form: {getFieldValue}} = this.props;
        let name = getFieldValue('name');
        const {pageNum, pageSize, startTimeStr, endTimeStr} = this.state;

        let params = {
            name,
            pageNo: pageNum,
            pageSize,
            beginTime: startTimeStr,
            endTime: endTimeStr,
            ...args,
        };
        this.setState({
            tabLoading: true,
        });
        promiseAjax.get(`/datasource`, params).then(rsp => {
            if (rsp.data != undefined) {
                this.setState({
                    pageNum: rsp.data.pageNo + 1,
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

    handleAddTask = () => {
        browserHistory.push('/dataSource/+add/addId');
    }

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {dataSource, total, pageNum, pageSize, tabLoading} =this.state;
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
                                    label="数据源名称">
                                    {getFieldDecorator('name')(
                                        <Input placeholder="请填写数据源名称" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout} label="创建时间">
                                    {getFieldDecorator('times', {
                                        initialValue: [moment().add(-72, 'hour'), moment()]
                                    })(
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
                            <Col span={8} style={{textAlign:'center'}}>
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
