/**
 * Created by lhyin on 2018/14/3.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Radio, Select, message, Modal, Row, Col, Table} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {session} from 'sx-ui/utils/storage';
import SelectDataSource from './SelectDataSource';
import './style.less';
import connectComponent from '../../../redux/store/connectComponent';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/dataTable/+add/:DataTableId';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        SourceType: [],
        fieldType: [],  //当前类型对应的字段
        dataSourceVisible: false, //选择数据源弹出层显示情况
        selectedDataSource: [],
        prefixsList: [],
        leftTableDataSource: [],
        rightTableDataSource: [],
        leftPageNum: 1,
        pageSize: 10,
        total: 0,
        prefixName: '',
        selectedRowKeys: [],
    };

    leftTableColumns = [
        {
            title: '候选表',
            render: (text, record) => {
                return (
                    record.allName
                );
            },
        },
    ];

    rightTableColumns = [
        {
            title: '选中表',
            render: (text, record) => {
                return (
                    record.allName
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <a onClick={() => this.handleDeleteDetail(record.allName)}>删除</a>
                );
            },
        },
    ];

    /**
     * 删除选中表
     */
    handleDeleteDetail = (allName)=> {
        const {rightTableDataSource, selectedRowKeys} =this.state;
        for (let key in rightTableDataSource) {
            if (rightTableDataSource[key]['allName'] === allName) {
                rightTableDataSource.splice(key, 1);
            }
        }
        for (let key in selectedRowKeys) {
            if (selectedRowKeys[key] === allName) {
                selectedRowKeys.splice(key, 1);
            }
        }
        this.setState({
            rightTableDataSource,
            selectedRowKeys,
        });
    };

    componentWillMount() {
    }

    /**
     * 提交表单
     */
    handleSubmit = ()=> {
        const {form, form: {getFieldValue}} = this.props;
        const {selectedDataSource, rightTableDataSource} =this.state;
        let bankName = getFieldValue('bankName');
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var plugins = {};
                plugins.bankName = bankName;
                plugins.dataType = selectedDataSource[0].dataType.code;
                plugins.sourceId = parseInt(selectedDataSource[0].id);
                let tabName = '';
                for (let key in rightTableDataSource) {
                    tabName += rightTableDataSource[key].allName + ',';
                }
                plugins.tableName = tabName.substring(0, tabName.length - 1);
                promiseAjax.post(`/datatable`, plugins).then(rsp => {
                    if (rsp.success) {
                        message.success('添加成功', 3);
                        history.back();
                    }
                });
            }
        })
    };

    /**
     * 充值表单数据
     */
    resetFieldsForm = () => {
        this.props.form.resetFields();
    };

    /**
     * 点击 input 选择数据源
     */
    selectDataSource = () => {
        this.setState({
            dataSourceVisible: true,
        })
    };

    handleCancel = (e) => {
        this.setState({
            dataSourceVisible: false,
            selectedDataSource: [],
        });
    };

    handleOk = (e) => {
        const {selectedDataSource} =this.state;
        const {setFieldsValue} = this.props.form;
        setFieldsValue({sourceId: selectedDataSource[0].name});
        this.setState({
            dataSourceVisible: false,
        });
        promiseAjax.get(`/datatable/prefixs/${selectedDataSource[0].id}`).then(rsp => {
            if (rsp.success) {
                this.setState({
                    prefixsList: rsp.data,
                });
            }
        }).finally(() => {
        });

    };

    /**
     * 初始化前缀下拉菜单
     */
    renderPrefixsOptions = () => {
        return this.state.prefixsList.map(item => {
            const keyStr = item;
            return <Select.Option key={keyStr}>{keyStr}</Select.Option>;
        });
    };

    changeDataSource(dataSource) {
        this.setState({
            selectedDataSource: dataSource,
        });
        console.log(dataSource);
    }

    handleChangePrefixs = (value) => {
        const {selectedDataSource, leftPageNum, pageSize, total} = this.state;
        let params = {
            pageNo: 1,
            pageSize: 10,
            sourceId: selectedDataSource[0].id,
            prefix: value,
            tableName: '',
        };
        promiseAjax.get(`/datatable/tables`, params).then(rsp => {
            if (rsp.success) {
                var data = rsp.data.result;
                var newData = [];
                for (let k in data) {
                    let dataItem = {};
                    dataItem.id = data[k][0];
                    dataItem.name = data[k][1];
                    dataItem.allName = data[k][2];
                    newData.push(dataItem);
                }
                console.log(newData);
                this.setState({
                    total: parseInt(rsp.data.totalItems),
                    prefixName: value,
                    leftTableDataSource: newData,
                });
            }
        }).finally(() => {
        });
        console.log(value);
    };

    searchLeftList = (value) => {
        const {selectedDataSource, prefixName} = this.state;
        let params = {
            sourceId: selectedDataSource[0].id,
            prefix: prefixName,
            tableName: '',
            ...value,
        };
        promiseAjax.get(`/datatable/tables`, params).then(rsp => {
            if (rsp.success) {
                var data = rsp.data.result;
                var newData = [];
                for (let k in data) {
                    let dataItem = {};
                    dataItem.id = data[k][0];
                    dataItem.name = data[k][1];
                    dataItem.allName = data[k][2];
                    newData.push(dataItem);
                }
                console.log(newData);
                this.setState({
                    total: parseInt(rsp.data.totalItems),
                    leftTableDataSource: newData,
                });
            }
        }).finally(() => {
        });
        console.log(value);
    };

    handlePageNumChange = (value) => {
        const {pageSize} = this.state;
        this.setState({
            leftPageNum: value,
        });
        const data = {
            pageSize,
            pageNo: value,
        };
        this.searchLeftList(data);
    }


    render() {
        const {getFieldDecorator} = this.props.form;
        const {dataSourceVisible, selectedRowKeys, leftTableDataSource, rightTableDataSource, leftPageNum, pageSize, total} =this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 5},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15},
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 15,
                    offset: 5,
                },
            },
        };
        const rowSelectionLeft = {
            selectedRowKeys,
            onSelect: (record, selected, selectedRows) => {
                if (selected) {
                    for (let key in leftTableDataSource) {
                        if (leftTableDataSource[key]['allName'] === record['allName']) {
                            rightTableDataSource.push(leftTableDataSource[key]);
                        }
                    }
                } else {
                    for (let key in rightTableDataSource) {
                        if (rightTableDataSource[key]['allName'] === record['allName']) {
                            rightTableDataSource.splice(key, 1);
                        }
                    }
                }
                this.setState({
                    rightTableDataSource,
                });
            },

            onChange: (selectedRowKeys, selectedRows) => {
                console.log(22);
                this.setState({selectedRowKeys});
            }
        };
        return (
            <PageContent>
                <div>
                    <div className="sub-title">新增数据表</div>
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="分组名称"
                            hasFeedback
                        >
                            {getFieldDecorator('bankName', {
                                rules: [{required: true, message: '请输入分组名称'}],
                            })(
                                <Input placeholder="分组名称"/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="数据源"
                            hasFeedback>
                            {getFieldDecorator('sourceId', {
                                rules: [{required: true, message: '请选择数据源'}],
                            })(
                                <Input onClick={() => this.selectDataSource()} placeholder="请选择数据源"/>
                            )}
                        </FormItem>

                        <FormItem
                            {...formItemLayout}
                            label="表前缀"
                            hasFeedback>
                            {getFieldDecorator('prefixs', {
                                rules: [{required: true, message: '请选择前缀'}],
                            })(
                                <Select
                                    showSearch
                                    style={{width: '100%'}}
                                    placeholder="请选择前缀"
                                    notFoundContent="暂无数据,请先选择数据源"
                                    onChange={this.handleChangePrefixs}
                                >
                                    {this.renderPrefixsOptions()}
                                </Select>
                            )}
                        </FormItem>
                        {
                            leftTableDataSource && leftTableDataSource.length ? <FormItem
                                {...formItemLayout}
                                label="选择表"
                                hasFeedback>
                                <Row>
                                    <Col span={12} style={{paddingRight: 15, lineHeight: 1.2}}>
                                        <Table
                                            rowSelection={rowSelectionLeft}
                                            size="middle"
                                            rowKey={(record) => record.allName}
                                            columns={this.leftTableColumns}
                                            dataSource={leftTableDataSource}
                                            pagination={false}
                                        />
                                        <PaginationComponent
                                            pageSize={pageSize}
                                            pageNum={leftPageNum}
                                            showSizeChanger={false}
                                            showQuickJumper={false}
                                            showMessage={false}
                                            total={total}
                                            onPageNumChange={this.handlePageNumChange}

                                        />
                                    </Col>
                                    <Col span={12} style={{paddingLeft: 15, lineHeight: 1.2}}>
                                        <Table
                                            size="middle"
                                            rowKey={(record) => record.allName}
                                            columns={this.rightTableColumns}
                                            dataSource={rightTableDataSource}
                                            pagination={false}
                                        />
                                    </Col>
                                </Row>
                            </FormItem> : null
                        }
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" onClick={() => this.handleSubmit()} style={{marginRight: 16}}
                                    size="large">提交</Button>
                            <Button type="ghost" htmlType="reset" size="large" onClick={this.resetFieldsForm}
                                    style={{marginRight: 16}}>
                                重置
                            </Button>
                            <Button type="primary" onClick={() => { history.back(); }} size="large">返回</Button>
                        </FormItem>
                    </Form>
                </div>
                {
                    dataSourceVisible ? <Modal
                        title="选择数据源"
                        visible={this.state.dataSourceVisible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                        width='70%'
                        style={{ top: 30 }}
                    >
                        <SelectDataSource changeDataSource={this.changeDataSource.bind(this)}/>
                    </Modal> : null
                }
            </PageContent>
        )
    }
}

export function

mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export
default

connectComponent({LayoutComponent, mapStateToProps});
