import React, {Component} from 'react';
import {PageContent, Operator, ToolBar, FormItemLayout} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import {Table, Button, Modal, Form, Input, Radio} from 'antd';

const RadioGroup = Radio.Group;

export const PAGE_ROUTE = '/menus';

@Form.create()
export default class Menus extends Component {
    state = {
        loading: false,
        dataSource: [],
        visible: false,
        data: {},
    };

    columns = [
        {title: '菜单名称', dataIndex: 'name', key: 'name'},
        {title: 'fatherCode', dataIndex: 'fathercode', key: 'fathercode'},
        {title: 'code', dataIndex: 'code', key: 'code'},
        {title: '路由地址', dataIndex: 'menuUrl', key: 'menuUrl'},
        {title: '排序', dataIndex: 'sort', key: 'sort'},
        {
            title: '状态',
            dataIndex: 'state',
            key: 'state',
            render: (text, record) => {
                if (record.state === 1) {
                    return (
                        <span className="green-text">启用</span>
                    );
                } else {
                    return (
                        <span className="gray-text">禁用</span>
                    )
                }
            }
        },
        {
            title: '操作', dataIndex: '__operator', key: '__operator',
            render: (text, record) => {
                const {id, name, state, code, level} = record;
                const valid = state === 1;
                const items = [
                    {
                        label: '新增子级',
                        onClick: () => {
                            const data = {fathercode: code, level: level + 1};
                            this.setState({data, visible: true});
                        },
                    },
                    {
                        label: '修改',
                        onClick: () => {
                            const data = {isModify: true, ...record};
                            this.setState({data, visible: true});
                        },
                    },
                    {
                        label: <span style={{color: 'red'}}>删除</span>,
                        confirm: {
                            title: `您确定删除${name}？`,
                            onConfirm: () => {
                                promiseAjax.del(`/cmenu/deleteMenu/${code}`)
                                    .then(res => {
                                        this.search();
                                    })
                            },
                        },
                    },
                    {
                        label: valid ? '停用' : '启用',
                        confirm: {
                            title: `您确定${valid ? '停用' : '启用'}${name}？`,
                            onConfirm: () => {
                                promiseAjax.put(`/cmenu/updateState?code=${code}&state=${valid ? 0 : 1}`)
                                    .then(res => {
                                        this.search();
                                    })
                            },
                        },
                    },
                ];

                return <Operator items={items}/>
            },
        },
    ];

    componentDidMount() {
        this.search();
    }

    search = () => {
        this.setState({loading: true});
        promiseAjax.get('/cmenu/getAll')
            .then(res => {
                let dataSource = [];
                if (res && res.data && res.data.length) {
                    dataSource = res.data;
                }
                dataSource.forEach(item => {
                    item.isTop = item.level === 1;
                    if (item.menus && item.menus.length) {
                        item.children = item.menus;
                    }
                });
                this.setState({dataSource});
            })
            .finally(() => {
                this.setState({loading: false});
            });
    };

    handleAddTop = () => {
        const data = {isTop: true, fathercode: -1, level: 1, menuUrl: '#'};
        this.setState({data, visible: true});
    };

    handleOk = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            const {isModify} = this.state.data;
            if (isModify) {
                promiseAjax.put('/cmenu/updateMenu', values, {successTip: '修改成功'})
                    .then(res => {
                        this.search();
                        this.setState({visible: false});
                    });
            } else {
                promiseAjax.post('/cmenu/add', values, {successTip: '添加成功'})
                    .then(res => {
                        this.search();
                        this.setState({visible: false});
                    });
            }
        });
    };

    handleRefresh = () => {
        promiseAjax.get('/cmenu/ref', null, {successTip: '刷新成功'})
            .then(res => {
            });
    };

    render() {
        const {
            dataSource,
            loading,
            visible,
            data,
        } = this.state;

        const {
            form: {getFieldDecorator},
        } = this.props;
        const labelSpaceCount = 8;
        return (
            <PageContent>
                <ToolBar>
                    <Button type="primary" size="large" onClick={this.handleAddTop}>添加顶级</Button>
                    <Button size="large" onClick={this.handleRefresh}>刷新</Button>
                </ToolBar>
                <Table
                    loading={loading}
                    columns={this.columns}
                    dataSource={dataSource}
                    rowKey="id"
                    pagination={false}
                />
                {visible ? (
                    <Modal
                        visible={visible}
                        title="子级"
                        onCancel={() => this.setState({visible: false})}
                        onOk={this.handleOk}
                    >
                        <Form>
                            {getFieldDecorator('level', {
                                initialValue: data.level,
                            })(
                                <Input type="hidden"/>
                            )}
                            {getFieldDecorator('id', {
                                initialValue: data.id,
                            })(
                                <Input type="hidden"/>
                            )}

                            <FormItemLayout
                                label="上级Code"
                                labelSpaceCount={labelSpaceCount}
                            >
                                {getFieldDecorator('fathercode', {
                                    initialValue: data.fathercode,
                                })(
                                    <Input disabled placeholder="请输入上级Code"/>
                                )}
                            </FormItemLayout>
                            <FormItemLayout
                                label="菜单名称"
                                labelSpaceCount={labelSpaceCount}
                            >
                                {getFieldDecorator('name', {
                                    initialValue: data.name,
                                    rules: [
                                        {required: true, message: '请输入菜单名称'},
                                    ],
                                })(
                                    <Input placeholder="请输入菜单名称"/>
                                )}
                            </FormItemLayout>
                            <FormItemLayout
                                label="code"
                                labelSpaceCount={labelSpaceCount}
                            >
                                {getFieldDecorator('code', {
                                    initialValue: data.code,
                                    rules: [
                                        {required: true, message: '请输入code'},
                                        {
                                            validator: (rule, value, callback) => {
                                                if (data.isModify && value === data.code) return callback();
                                                promiseAjax.get('/cmenu/checkCode', {code: value})
                                                    .then(res => {
                                                        if (res.data) return callback('此code被占用！');
                                                        return callback();
                                                    });
                                            },
                                        }
                                    ],
                                })(
                                    <Input
                                        disabled={data.isModify && data.isTop}
                                        placeholder="请输入code"
                                    />
                                )}
                            </FormItemLayout>
                            <FormItemLayout
                                label="url"
                                labelSpaceCount={labelSpaceCount}
                            >
                                {getFieldDecorator('menuUrl', {
                                    initialValue: data.menuUrl,
                                    rules: [
                                        {required: true, message: '请输入url'},
                                    ],
                                })(
                                    <Input
                                        placeholder="请输入url"
                                    />
                                )}
                            </FormItemLayout>
                            <FormItemLayout
                                label="排序"
                                labelSpaceCount={labelSpaceCount}
                            >
                                {getFieldDecorator('sort', {
                                    initialValue: data.sort,
                                    rules: [
                                        {required: true, message: '请输入排序'},
                                    ],
                                })(
                                    <Input placeholder="请输入排序"/>
                                )}
                            </FormItemLayout>
                            <FormItemLayout
                                label="图标"
                                labelSpaceCount={labelSpaceCount}
                            >
                                {getFieldDecorator('menuImage', {
                                    initialValue: data.menuImage,
                                    rules: [
                                        {required: true, message: '请输入图标'},
                                    ],
                                })(
                                    <Input placeholder="请输入图标"/>
                                )}
                            </FormItemLayout>
                            <FormItemLayout
                                label="是否启用"
                                labelSpaceCount={labelSpaceCount}
                            >
                                {getFieldDecorator('state', {
                                    initialValue: data.state === void 0 ? 1 : data.state,
                                })(
                                    <RadioGroup>
                                        <Radio value={1}>启用</Radio>
                                        <Radio value={0}>停用</Radio>
                                    </RadioGroup>
                                )}
                            </FormItemLayout>
                            <FormItemLayout
                                label="是否是叶子节点"
                                labelSpaceCount={labelSpaceCount}
                            >
                                {getFieldDecorator('isleaf', {
                                    initialValue: data.isleaf === void 0 ? 1 : data.isleaf,
                                    rules: [
                                        {required: true, message: '选择是否是叶子节点'},
                                    ],
                                })(
                                    <RadioGroup>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>
                                    </RadioGroup>
                                )}
                            </FormItemLayout>
                        </Form>
                    </Modal>
                ) : null}
            </PageContent>
        );
    }
}
