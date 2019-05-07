/**
 * Created by lhyin on 2017/12/5.
 */
import React, {Component} from 'react';
import {
    Form,
    Input,
    Button,
    Table,
    Select,
    Row,
    Col,
    DatePicker,
    message,
    Popconfirm,
    Modal,
    Radio,
    Checkbox,
} from 'antd';
import {PageContent, PaginationComponent, QueryBar, FontIcon} from 'sx-ui/antd';
import {browserHistory} from 'react-router';
import moment from 'moment';
import {promiseAjax} from 'sx-ui';
import './style.less';
import {formatDefaultTime} from '../common/getTime';

import connectComponent from '../../redux/store/connectComponent';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

export const PAGE_ROUTE = '/synchTask';

@Form.create()
export class LayoutComponent extends Component {

    state = {
        pageNum: 1,
        pageSize: 10,
        total: 0,
        application: [],
        startTimeStr: '', // 开始时间
        endTimeStr: '',   // 结束时间(默认当前时间)
        endTime: Date(),
        dataSource: [],
        tabLoading: false,
        visible: false,
        applicationName: '',
        confirmLoading: false,
        data:[],
        visableTable: false,
        value: null,
        dicControlTypePlugins: [],
        owner: null,
        record: null,
        loading: false,
        shareOwner: null
    };

    columns = [
        {
            title: '序号',
            key: '__number',
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
        },
        {
            title: '任务ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '任务名称',
            dataIndex: 'jobName',
            key: 'jobName',
            width: 200,
        },
        {
            title: '来源数据-消费插件',
            dataIndex: 'sourceConsumeAdt.name',
            key: 'sourceConsumeAdt.name',
        },
        {
            title: '来源数据-消费转换插件',
            dataIndex: 'sourceConvertAdt.name',
            key: 'sourceConvertAdt.name',
        },
        {
            title: '目标数据-载入插件',
            dataIndex: 'targetLoadAdt.name',
            key: 'targetLoadAdt.name',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => formatDefaultTime(text),
        },
        {
            title: '权限设置',
            dataIndex: 'PermissionSet',
            key: 'PermissionSet',
            render: (text, record) => (
                <a
                    onClick={
                        () => this.showModal(record)
                    }
                >
                    设置
                </a>
            )
        },
        {
            title: '状态',
            dataIndex: 'jobState.name',
            key: 'jobState.name',
            render: text => (
                <span
                    style={{
                        color: text === "工作中" ? "green" : "gray"
                    }}
                >
                    {text}
                </span>
            )
        },
        {
            title: '操作',
            key: 'operator',
            render: (text, record) => {
                if (record.jobState.name === '新建') {
                    return (
                        <span>
                            <a onClick={() => this.handleUpdate(record.id)}>编辑</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleStop('WORKING', record.id)}>开始</a>
                            <span className="ant-divider"/>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                                <a>删除</a>
                            </Popconfirm>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    );
                } else if (record.jobState.name === '工作中') {
                    return (
                        <span>
                            <a onClick={() => this.handleStop('STOPPED', record.id)}>停止</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    );
                } else if (record.jobState.name === '已停止') {
                    return (
                        <span>
                            <a onClick={() => this.handleUpdate(record.id)}>编辑</a>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleStop('WORKING', record.id)}>开始</a>
                            <span className="ant-divider"/>
                            <Popconfirm title="是否确定删除?" onConfirm={() => this.handleDelete(record.id)}>
                                <a>删除</a>
                            </Popconfirm>
                            <span className="ant-divider"/>
                            <a onClick={() => this.handleDetail(record.id)}>查看</a>
                        </span>
                    );
                }
            },
        },
    ];

    /**
     *权限设置columns
     */
    setTingsForm = [
        {
            name: "任务所有者",
            key: "name",
            init: null,
            rule: null,
            labelCol: 10,
            wrapperCol: 14,
            disable: true,
            span: 7,
            type: "input"
        },{
            name: "任务共享者",
            key: "shareOwner",
            init: null,
            rule: null,
            labelCol: 5,
            wrapperCol: 18,
            disable: true,
            span: 14,
            type:  "input"
        },{
            name: "操作类型",
            key: "oprType",
            init: null,
            rule: [{
                required: true, message: '请选择操作类型!',
            }],
            labelCol: 3,
            wrapperCol: 20,
            disable: false,
            span: 23,
            type: "radio"
        }
    ];

    columnsModal = [{
        title: '',
        dataIndex: 'sj',
        width: 100,
        render: (text, record) => (
            <Radio
                value={record.nickname}
                onChange={
                    (e) => this.handelChange(e,record.nickname)
                }
                checked={
                    record.sj === 1 ? true : false
                }
            >
            </Radio>
            )
        },{
        title: '用户',
        dataIndex: 'nickname',
        width: 180
    },{
        title: '部门',
        dataIndex: 'departMent',
        width: 180
    },{
        title: '操作',
        dataIndex: 'opr',
        render: (text, record)=> (
            <Popconfirm
                title="确定移除?"
                onConfirm={
                    () => this.handelDel(record.nickname)
                }
                okText="是"
                cancelText="否"
            >
                <a
                    disabled = {
                        record.sj === 1 ? false : true
                    }
                >
                    移除
                </a>
            </Popconfirm>

        )
    }];

    /**
     * 权限设置
     */
    showModal = (record) => {
        this.setState({
            visible: true,
            record,
        });
        promiseAjax.get(`/jobtasksowner/setPage/${record.id}`).then(
            res => {
                this.props.form.setFieldsValue({
                    name:res.data.owner ? res.data.owner.name : "无",
                    shareOwner: res.data.shareOwner ? this.aryOper(res.data.shareOwner,"name").join(",") : "无"
                });
                this.setState({
                    dicControlTypePlugins: res.data.dicControlTypePlugins,
                    owner: res.data.owner,
                    shareOwner: res.data.shareOwner
                })
            }
        );
    };

    /**
     * 处理数组问题
     * @param ary
     * @param val
     * @returns {Array}
     */
    aryOper = (ary,val) => {
        let arry = [];
        ary && ary.map (
            v => {
                arry.push(v[val])
            }
        );
        return arry
    };

    /**
     * 操作类型
     * @param e
     */
     handleRadio = (e) => {
        let value = e.target.value;
        const {shareOwner} = this.state;
        this.setState({
            loading: true
        });
        promiseAjax.get(`/cuser/findRegister`).then(
            res => {
                    let arry = this.state.owner
                        ? res.data.filter(
                                v => v.id !== this.state.owner.ownerId
                            )
                        : res.data;
                    if (value === "SHARE" || value === "RECYCLE") {
                        let ownerId = this.aryOper(shareOwner,"ownerId");
                        arry.forEach(
                            (v,index) => {
                                ownerId.indexOf(v.id) !== -1
                                    ? arry[index]["sj"] = 1
                                    : null
                            }
                        );
                    }
                    this.setState({
                        data: arry,
                        loading: false
                    });
            }
        );
        value === "CHANGE" || value === "SHARE"
            ? this.setState({
                visableTable: true,
                value
            })
            : this.setState({
                visableTable: false
            });
    };

    /**
     * 选择归属明细
     * @param e
     */
    handelChange = (e,record) => {
        const {data} = this.state;
        data.map(
            item => {
                if(this.state.value === "SHARE"){
                    if (item.nickname === record) {
                        item.sj = 1;
                    }
                    return
                }
                if (item.nickname === record) {
                    item.sj = 1;
                } else {
                    item.sj = 0;
                }
            }
        );
        this.setState({data});
    };

    /**
     * 移除归属明细
     */
    handelDel = (record) => {
        const {data} = this.state;
        data.map(
            v => {
                if (v.nickname === record) {
                    v.sj = 0;
                }
            }
        );
        this.setState({data})
    };

    handleOk = () => {
        this.setState({
            confirmLoading: true,
        });
        const radioValue = this.props.form.getFieldValue('oprType');
        const { record, data } = this.state;
        let toUserIds = data.filter(
            v => v.sj === 1
        );
        const ControlSettingVo = {
            controlTypeEnum: radioValue,
            jobId: record.id,
            toUserIds: this.aryOper(toUserIds,"id")
        };
        this.props.form.validateFieldsAndScroll((err) => {
            if (!err) {
                promiseAjax.put( `/jobtasksowner`, ControlSettingVo ).then(
                    res => {
                        res.code === 200
                        ? message.success("操作成功!")
                        : message.error("操作失败!");
                        this.handleCancel();
                        this.search();
                    }
                ).finally(
                    () => {
                        this.setState({
                            confirmLoading: false,
                        });
                    }
                );
            }
        });
    };

    handleCancel = () => {
        this.props.form.resetFields(["oprType"]);
        this.setState({
            visible: false,
            visableTable: false,
        });
    };

    /**
     * 编辑任务
     * @param id
     */
    handleUpdate = (id) => {
        browserHistory.push(`/synchTask/+add/${id}`);
    };

    /**
     * 查看元素
     */
    handleDetail = (id) => {
        browserHistory.push(`/synchTask/+detail/${id}`);
    };

    /**
     * 删除
     * @param id
     */
    handleDelete = (id) => {
        this.setState({
            tabLoading: true,
        });
        promiseAjax.del(`/jobtasks/${id}`).then(rsp => {
            if (rsp.success) {
                const {dataSource, total} = this.state;
                this.setState({
                    dataSource: dataSource.filter(item => item.id !== id),
                    total: total - 1,
                });
                message.success('删除成功', 3);
            }
        }).finally(() => {
            this.setState({
                tabLoading: false,
            });
        });
    };

    /**
     * 开始任务
     * @param id
     */
    handleStop = (type, id) => {
        this.setState({
            tabLoading: true,
        });
        let typeStr = '';
        if (type === 'STOPPED') {
            typeStr = '已停止';
        } else {
            typeStr = '工作中';
        }
        promiseAjax.put(`/jobtasks/${id}?taskStatusType=${type}`).then(rsp => {
            if (rsp.success) {
                const {dataSource} = this.state;
                dataSource.forEach((key, value) => {
                    if (key.id === id) {
                        dataSource[value].jobState.name = typeStr;
                        dataSource[value].jobState.code = type;
                    }
                });
                this.setState({
                    dataSource,
                });
                message.success('操作成功', 3);
            }
        }).finally(() => {
            this.setState({
                tabLoading: false,
            });
        });
    };

    componentDidMount() {
        this.search();
    }

    search = (args) => {
        const {form: {getFieldValue}} = this.props;
        let jobName = getFieldValue('jobName');
        let jobId = getFieldValue('jobId');
        let times = getFieldValue('times');
        const jobState = getFieldValue('jobState');

        let endTimeStr = '';
        let startTimeStr = '';
        if (times !== undefined) {
            if (times.length > 0) {
                endTimeStr = moment(times[1]).format('YYYY-MM-DD HH:mm:ss');
                startTimeStr = moment(times[0]).format('YYYY-MM-DD HH:mm:ss');
            }
        }
        const {pageNum, pageSize} = this.state;

        let params = {
            jobId,
            jobName,
            jobState,
            pageNo: pageNum,
            pageSize,
            beginTime: startTimeStr,
            endTime: endTimeStr,
            ...args,
        };
        this.setState({
            tabLoading: true,
        });
        promiseAjax.get('/jobtasks', params).then(rsp => {
            if (rsp.success && rsp.data) {
                this.setState({
                    pageNum: rsp.data.pageNo,
                    pageSize: rsp.data.pageSize,
                    total: window.parseInt(rsp.data.totalItems),
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
    };

    /**
     * 查询
     */
    handleQuery = (values) => {
        this.setState({
            pageNum: 1,
        });
        const data = {
            pageNo: 1,
        };
        this.search(data);
    };

    /**
     * 重置
     * @param data
     */
    handleReset = () => {
        this.props.form.resetFields();
        this.setState({
            pageNum: 1,
        });
        const data = {
            pageNo: 1,
        };
        this.search(data);
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
    };

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
    };

    /**
     * 设置时间
     */
    onOk = (value) => {
        this.setState({
            startTimeStr: moment(value[0]).format('YYYY-MM-DD HH:mm:ss'),
            endTimeStr: moment(value[1]).format('YYYY-MM-DD HH:mm:ss'),
        });
    };

    handleAddTask = () => {
        browserHistory.push('/synchTask/+add/TaskId');
    };

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {
            dataSource,
            total,
            pageNum,
            pageSize,
            tabLoading,
            visible,
            confirmLoading,
            data,
            visableTable,
            dicControlTypePlugins,
            loading
        } = this.state;
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
        return (
            <PageContent>
                <QueryBar>
                    <Form>
                        <Row>
                            <Col style={{width: "20%", float:'left'}}>
                                <FormItem
                                    {...formItemLayout}
                                    label="任务ID">
                                    {getFieldDecorator('jobId')(
                                        <Input placeholder="请填写任务Id" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>

                            <Col style={{width: "20%", float:'left'}}>
                                <FormItem
                                    {...formItemLayout}
                                    label="任务名称">
                                    {getFieldDecorator('jobName')(
                                        <Input placeholder="请填写任务名称" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>

                            <Col style={{width: "20%", float:'left'}}>
                                <FormItem
                                    {...formItemLayout}
                                    label="状态">
                                    {getFieldDecorator('jobState')(
                                        <Select placeholder="请选择状态">
                                            <Option value="NEW">新建</Option>
                                            <Option value="STOPPED">已停止</Option>
                                            <Option value="WORKING">工作中</Option>
                                            <Option value="DELETED">已删除</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>

                            <Col style={{width: "20%", float:'left'}}>
                                <FormItem
                                    {...formItemLayout} label="创建时间">
                                    {getFieldDecorator('times', {})(
                                        <RangePicker
                                            showTime
                                            style={{width: '100%'}}
                                            format="YYYY-MM-DD HH:mm"
                                            placeholder={['开始时间', '结束时间']}
                                            onOk={this.onOk}
                                        />
                                    )}

                                </FormItem>
                            </Col>
                            <Col style={{width: "20%",  float:'left', textAlign: 'right'}}>
                                <FormItem
                                    label=""
                                    colon={false}>
                                    <Button
                                        type="primary"
                                        onClick={() => this.handleAddTask()}
                                    ><FontIcon type="plus"/>新增</Button>
                                    <Button
                                        type="primary"
                                        onClick={() => this.handleQuery(getFieldsValue())}
                                        style={{marginLeft: 15}}
                                    ><FontIcon type="search"/>查询</Button>
                                    <Button
                                        type="ghost"
                                        onClick={() => this.handleReset()}
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
                <Modal
                    title="权限控制"
                    visible={visible}
                    onOk={this.handleOk}
                    confirmLoading={confirmLoading}
                    onCancel={this.handleCancel}
                    width="50%"
                >
                    <Form>
                        <Row>
                            {
                                this.setTingsForm && this.setTingsForm.map(
                                    (v,k) =>
                                        <Col span={v.span} key={k}>
                                            <FormItem
                                                label={v.name}
                                                labelCol={{span:v.labelCol}}
                                                wrapperCol={{span:v.wrapperCol}}
                                                key={k}
                                            >

                                                {getFieldDecorator(v.key,{
                                                    initialValue: v.init,
                                                    rules: v.rule
                                                })(

                                                        v.type === "input"
                                                        ? <Input style={{border: "none"}} readOnly="readonly"/>
                                                        : v.type === "radio"
                                                            ? <RadioGroup onChange={this.handleRadio}>
                                                                {
                                                                    dicControlTypePlugins && dicControlTypePlugins.map(
                                                                        v => {
                                                                            return <Radio
                                                                                        key={v.alertType}
                                                                                        value={v.alertType}
                                                                                    >
                                                                                        {v.fieldName}
                                                                                    </Radio>
                                                                        }
                                                                    )
                                                                }
                                                                </RadioGroup>
                                                            : <p/>
                                                )}
                                            </FormItem>
                                        </Col>
                                )
                            }
                        </Row>
                    </Form>
                    {
                        visableTable
                            ? <div style={{margin: "0 10px"}}>
                                <Table
                                    columns={this.columnsModal}
                                    dataSource={data}
                                    pagination={false}
                                    scroll={{ y: 340 }}
                                    rowKey={record => record.id}
                                    loading={loading}
                                />
                              </div>
                            : null
                    }
                </Modal>
            </PageContent>
        );
    }
}

export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
