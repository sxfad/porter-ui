/**
 * Created by lhyin on 2018/19/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Row, Col, Select, message, Popconfirm} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import './style.less';
import {browserHistory} from 'react-router';
import connectComponent from '../../redux/store/connectComponent';

const FormItem = Form.Item;
export const PAGE_ROUTE = '/user';
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
            title: '登录名',
            render: (text, record) => {
                return (
                    record.loginname
                );
            },
        },
        {
            title: '昵称',
            render: (text, record) => {
                return (
                    record.nickname
                );
            },
        },
        {
            title: '邮箱',
            render: (text, record) => {
                return (
                    record.email
                );
            },
        },
        {
            title: '手机号',
            render: (text, record) => {
                return (
                    record.mobile
                );
            },
        },
        {
            title: '部门',
            render: (text, record) => {
                return (
                    record.departMent === null ? '--' : record.departMent
                );
            },
        },
        {
            title: '角色',
            render: (text, record) => {
                return (
                    record.roleCode === null ? '--' : record.roleCode
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <span>
                        <a onClick={() => this.handleUpdate(record.id)}>编辑</a>
                        <span className="ant-divider"/>
                        <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                          <a href="#">删除</a>
                        </Popconfirm>
                    </span>
                )

            }
        },
    ];

    /**
     * 编辑任务
     * @param id
     */
    handleUpdate = (id) => {
        browserHistory.push(`/user/+add/${id}`);
    }

    /**
     * 查看元素
     */
    handleDetail = (id)=> {
        browserHistory.push(`/user/+detail/${id}`);
    };

    componentDidMount() {
        this.search();
    }

    /**
     * 删除元素
     */
    handleDelete = (userid)=> {
        this.setState({
            tabLoading: true,
        });
        promiseAjax.del(`/cuser/${userid}`).then(rsp => {
            if (rsp.success) {
                const {dataSource, total} = this.state
                this.setState({
                    dataSource: dataSource.filter(item => item.id !== userid),
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

    search = (args) => {
        const {form} = this.props;
        const {pageNum, pageSize} = this.state;
        let params = {
            pageNo: pageNum,
            pageSize,
            ...args,
        };
        this.setState({
            tabLoading: true,
        });
        promiseAjax.get(`/cuser`, params).then(rsp => {
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

    handleAddTask = () => {
        browserHistory.push('/user/+add/UserId');
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
        return (
            <PageContent>
                <Button type="primary" onClick={() => this.handleAddTask()}
                        style={{marginLeft: 15}}><FontIcon type="plus"/>新增</Button>

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
