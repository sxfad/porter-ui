/**
 * Created by lhyin on 2018/20/3.
 */
import React, {Component} from 'react';
import {Form, Table, Row, Col, Input, Button, DatePicker} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import {getBeforeHoursTime, formatDefaultTime} from '../../common/getTime';
import moment from 'moment';
import './style.less';
import connectComponent from '../../../redux/store/connectComponent';

export const PAGE_ROUTE = '/selectDataSource';
const {RangePicker} = DatePicker;
const FormItem = Form.Item;
@Form.create()
export class LayoutComponent extends Component {
    state = {
        pageNum: 1,
        pageSize: 8,
        total: 0,
        startTimeStr: '', //开始时间
        endTimeStr: '',   //结束时间(默认当前时间)
        endTime: Date(),
        dataSource: [],
        tabLoading: false,
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
    ];


    componentDidMount() {
        this.search();
    }

    search = (args) => {
        const {form: {getFieldValue}} = this.props;
        let name = getFieldValue('name');
        let times = getFieldValue('times');
        let endTimeStr = '',
            startTimeStr = '';
        if (times != undefined) {
            endTimeStr = moment(times[1]).format('YYYY-MM-DD HH:mm:ss');
            startTimeStr = moment(times[0]).format('YYYY-MM-DD HH:mm:ss');
        }
        const {pageNum, pageSize} = this.state;

        let params = {
            name,
            pageNo: pageNum,
            pageSize,
            beginTime: startTimeStr,
            endTime: endTimeStr,
            ...args,
            dataType: 'JDBC',
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

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {dataSource, total, pageNum, pageSize, tabLoading} = this.state;

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 9},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15},
            },
        };
        const queryItemLayout = {
            xs: 12,
            md: 8,
            lg: 6,
        };

        const rowSelection = {
            type: 'radio',
            onChange: (selectedRowKeys, selectedRows) => {
                this.props.changeDataSource(selectedRows);
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
                                    label="数据源名称">
                                    {getFieldDecorator('name')(
                                        <Input placeholder="请填写数据源名称" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={10}>
                                <FormItem
                                    {...formItemLayout} label="创建时间">
                                    {getFieldDecorator('times', {
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
                                    <Button type="primary" onClick={()=>this.handleQuery(getFieldsValue())}
                                            style={{marginLeft: 15}}><FontIcon type="search"/>查询</Button>
                                    <Button type="ghost" onClick={() => this.handleReset()}
                                            style={{marginLeft: 15}}>重置</Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </QueryBar>
                <Table
                    rowSelection={rowSelection}
                    size="middle"
                    rowKey={(record) => record.id}
                    columns={this.columns}
                    dataSource={dataSource}
                    pagination={false}
                />
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
