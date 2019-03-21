/**
 * Created by lhyin on 2018/19/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, DatePicker, Popconfirm,Pagination,message} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import moment from 'moment';
import {getBeforeHoursTime, formatDefaultTime} from '../../common/getTime';
import {browserHistory} from 'react-router';
import connectComponent from '../../../redux/store/connectComponent';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
export const PAGE_ROUTE = '/publicDataSource';
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
    }

    columns = [
        {
            title: '序号',
            key: '__num',
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
        },

        {
            title: '识别码',
            dataIndex: 'code',
            key: 'code'
        },
        {
            title: '数据源名称',
            dataIndex: 'name',
            key: 'name'
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
            dataIndex: 'ispush',
            key: 'ispush',
            render: (text, record) => {
                if (record.ispush === 0 ) {
                    return (
                        <span >新增</span>
                    );
                } if (record.ispush === -1) {
                    return (
                        <span >回收</span>
                    );
                }
                if (record.ispush === 1) {
                    return (
                        <span >已推送</span>
                    );
                }
            },
        },

        {
            title: '操作',
            render: (text, record) => {

                if (record.ispush === 0 || record.ispush === -1) {
                    return (
                <span>
                     <a onClick={() => this.handleUpdate(record.id)}>编辑</a>
                    <span className="ant-divider"/>
                    <a onClick={() => this.handlePush(record.id)}>推送</a>
                    <span className="ant-divider"/>
                    <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record)}>
                      <a href="#">删除</a>
                    </Popconfirm>
                     <span className="ant-divider"/>
                    <a onClick={() => this.handleDetail(record.id)}>查看</a>
                </span>
            );
                }
                else if (record.ispush === 1 ) {
                    return (
                      <span>
                    <a onClick={() => this.handleRecycle(record.id)}>回收</a>
                     <span className="ant-divider"/>
                    <a onClick={() => this.handleDetail(record.id)}>查看</a>
                </span>
                );
                }
            },
        },
    ];

    componentWillMount() {
        this.search();
    }

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
     * 查看元素
     */
    handleDetail = (id) => {
        browserHistory.push(`/publicDetail/+detail/${id}`);
    };
    /**
     * 编辑元素
     */
    handleUpdate = (id) => {
        browserHistory.push(`/publicDataSource/+edit/${id}`);
    };

    /**
     * 删除元素
     */
    handleDelete = (record)=> {
        const {id} = record;
        this.setState({
            tabLoading: true,
        });
        promiseAjax.del(`/pdse/${id}`).then(rsp => {
            if (rsp.success) {
                const {dataSource, total} = this.state;
                this.setState({
                    dataSource: dataSource.filter(item => item.id !== id),
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
     * 推送
     */
    handlePush= (id)=> {
        promiseAjax.post(`/pdse/push/${id}`)
            .then(rsp => {
            if (rsp.success) {
                const {dataSource} = this.state;
                this.setState({
                    dataSource,
                });
                message.success('推送成功', 3);
                this.search();
            }
        }).finally(() => {
            this.setState({
                tabLoading: false,
            });
        });
    };

    /**
     * 回收
     */
    handleRecycle= (id)=> {
        promiseAjax.post(`/pdse/takeback/${id}`)
            .then(rsp => {
                if (rsp.success) {
                    const {dataSource} = this.state;
                    this.setState({
                        dataSource,
                    });
                    message.success('回收成功', 3);
                    this.search();
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
    handleDetail = (id)=> {
        browserHistory.push(`/publicDetail/+detail/${id}`);
    };

    search = (args = {}) => {
        const {pageNum = this.state.pageNum, pageSize = this.state.pageSize} = args;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                promiseAjax.get(`/pdse?pageNum=${pageNum}&pageSize=${pageSize}`, values)
                    .then(rsp => {
                        let total = 0;
                        let dataSource = [];
                        let pageNum = this.state.pageNum;
                        if (rsp) {
                            total = parseInt(rsp.data.totalItems) || 0;
                            dataSource = rsp.data.result || [];
                            pageNum = rsp.data.pageNo;
                            this.setState({total, dataSource, pageNum, tableLoading: false});
                        }

                    })
                    .finally(() => this.setState({loading: false, tableLoading: false}));
            }
        });
    };

    // 默认获取数据分页
    changePage = (pageNum) => {
        //塞数据
        this.setState({pageNum: pageNum});
        //塞数据后立即执行函数并使用数据时，会产生异步，此时我们获取不到最新的值，所以我们这个时候传参
        this.search({pageNum: pageNum, pageSize: this.state.pageSize});
    };

    onShowSizeChange = (current, pageSize) => {
        console.log(current, pageSize);
    }

    /**
     * 重置
     * @param data
     */
    handleReset = ()=> {
        this.props.form.resetFields();
        // this.setState({
        //     pageNum: 1,
        // });
        // const data = {
        //     pageNo: 1,
        // }
        // this.search(data);
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


    handleAddTask = () => {
        browserHistory.push('/publicDataSource/+edit/:id');
    }

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {dataSource,tabLoading} =this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
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
                                    label="识别码">
                                    {getFieldDecorator('code')(
                                        <Input placeholder="请填写识别码" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col {...queryItemLayout}>
                                <FormItem
                                    {...formItemLayout}
                                    label="名称">
                                    {getFieldDecorator('name')(
                                        <Input placeholder="请填写名称" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col {...queryItemLayout}>
                                <FormItem
                                    {...formItemLayout}
                                    label="ip地址">
                                    {getFieldDecorator('ipsite')(
                                        <Input placeholder="请填写ip地址" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={6} style={{textAlign:'center'}}>
                                <FormItem
                                    label=""
                                    colon={false}>
                                    <Button
                                        type="primary" onClick={() => this.handleAddTask()}
                                            style={{marginLeft: 15}}><FontIcon type="plus"/>新增
                                    </Button>
                                    <Button
                                        type="primary"  onClick={() => this.search({pageNum: 1})}
                                            style={{marginLeft: 15}}><FontIcon type="search"/>查询
                                    </Button>
                                    <Button type="ghost" onClick={() => this.handleReset()}
                                            style={{marginLeft: 15}}>重置
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
                <Pagination
                    current={this.state.pageNum}//当前的页数
                    total={this.state.total}//接受的总数
                    pageSize={this.state.pageSize}//一页的条数
                    onChange={this.changePage}//改变页数
                    showQuickJumper//快速跳转
                    style={{textAlign: 'right', marginTop: '20px'}}
                    showSizeChanger
                    onShowSizeChange={this.onShowSizeChange}
                    showTotal={total => `共 ${total}条`}//共多少条
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
