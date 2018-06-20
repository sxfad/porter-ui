/**
 * Created by lhyin on 2018/29/5.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, Select, message, Popconfirm} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import './style.less';
import {browserHistory} from 'react-router';
import {formatDefaultTime} from '../common/getTime';
import connectComponent from '../../redux/store/connectComponent';

const md5 = require('../common/md5');
const FormItem = Form.Item;
export const PAGE_ROUTE = '/oggTables';
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
            title: 'ip地址',
            render: (text, record) => {
                return (
                    record.ipAddress
                );
            },
        },
        {
            title: '表名称',
            render: (text, record) => {
                return (
                    record.tableValue
                );
            },
        },
        {
            title: '最后心跳时间',
            render: (text, record) => {
                return (
                    record.heartBeatTime
                );
            },
        },
        {
            title: '任务关联',
            render: (text, record) => {
                return (
                    formatDefaultTime(record.relatedTaskInfo)
                );
            },
        },
    ];

    componentDidMount() {
        this.search();
    }

    search = (args) => {
        const {form: {getFieldValue}} = this.props;
        const {pageNum, pageSize} = this.state;
        let ipAddress = getFieldValue('ipAddress');
        let tableValue = getFieldValue('tableValue');
        let params = {
            pageNo: pageNum,
            pageSize,
            ...args,
            ipAddress,
            tableValue,
        };
        this.setState({
            tabLoading: true,
        });
        promiseAjax.get(`/ogg/tablespage`, params).then(rsp => {
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
    };

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
                                    label="ip地址">
                                    {getFieldDecorator('ipAddress')(
                                        <Input placeholder="请填写ip地址" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="表名称">
                                    {getFieldDecorator('tableValue')(
                                        <Input placeholder="请填写表名称" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={7} style={{textAlign:'right'}}>
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
