/**
 * Created by lhyin on 2018/19/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, DatePicker, Popconfirm} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import moment from 'moment';
import {getBeforeHoursTime, formatDefaultTime} from '../../common/getTime';
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
        startTimeStr: '', //开始时间
        endTimeStr: '',   //结束时间(默认当前时间)
        endTime: Date(),
        dataSource: [],
        tabLoading: false,
        dataSign: null
    };

    columns = [
        {
            title: '编号',
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
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
            render: (text, record) => {
                return (
                    formatDefaultTime(record.createTime)
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.handleDetail(record.id)}>查看</a>
                    <span className="ant-divider"/>
                    <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                      <a href="#">删除</a>
                    </Popconfirm>
                    <span style={{display: this.state.dataSign ? null : "none"}}>
                        <span className="ant-divider"/>
                        <a onClick={() => this.handlePermissionSet(record)}>权限设置</a>
                    </span>
                </span>
            )
        },
    ];

    /**
     * 权限设置
     * @param record
     */
    handlePermissionSet = (record) => {
        const { dataSign } = this.state;
        browserHistory.push({
            pathname: `/PermissionSet/${record.id}`,
            state: { dataSign:dataSign, path:"/dataSource", text:"数据源配置" }
        })
    };

    componentDidMount() {
        const {form: {getFieldValue}} = this.props;
        // let times = getFieldValue('times');
        // let endTimeStr = moment(times[1]).format('YYYY-MM-DD HH:mm:ss');
        // let startTimeStr = moment(times[0]).format('YYYY-MM-DD HH:mm:ss');
        // this.setState({
        //     startTimeStr,
        //     endTimeStr,
        // });
        // const searchData = {
        //     beginTime: startTimeStr,
        //     endTime: endTimeStr,
        // };
        this.search();
    }

    /**
     * 删除元素
     */
    handleDelete = (sourceid)=> {
        this.setState({
            tabLoading: true,
        });
        promiseAjax.del(`/datasource/${sourceid}`).then(rsp => {
            if (rsp.success) {
                const {dataSource, total} = this.state
                this.setState({
                    dataSource: dataSource.filter(item => item.id !== sourceid),
                    total: total - 1
                });
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
        browserHistory.push(`/dataSource/+detail/${sourceid}`);
    };

    search = (args) => {
        const {form: {getFieldValue}} = this.props;
        let name = getFieldValue('name');
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
                    pageNum: rsp.data.pageNo,
                    pageSize: rsp.data.pageSize,
                    total: parseInt(rsp.data.totalItems),
                    dataSource: rsp.data.result,
                    startTimeStr,
                    endTimeStr,
                    dataSign : rsp.dataSign
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
                                        // initialValue: [moment().add(-172, 'hour'), moment().add(1, 'hour')]
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
