/**
 * Created by lhyin on 2017/12/5.
 */
import React, {Component} from 'react';
import {Form, Input, Button, Table, Select, Row, Col, DatePicker} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import moment from 'moment';
import './style.less';
import {browserHistory} from 'react-router';
import connectComponent from '../../redux/store/connectComponent';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
export const PAGE_ROUTE = '/synchtask';
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
            { name: '任务名称1', state:'新建/运行中/删除', creatTime: '2017.11.13 12:12:12', xiaofei:'kafka', zairu: 'jdbc', zhuanhuan: 'oggConvert'},
            { name: '任务名称2', state:'新建/运行中/删除', creatTime: '2017.11.13 12:12:12', xiaofei:'kafka', zairu: 'jdbc', zhuanhuan: 'oggConvert'},
            { name: '任务名称3', state:'新建/运行中/删除', creatTime: '2017.11.13 12:12:12', xiaofei:'kafka', zairu: 'jdbc', zhuanhuan: 'oggConvert'},
            { name: '任务名称4', state:'新建/运行中/删除', creatTime: '2017.11.13 12:12:12', xiaofei:'kafka', zairu: 'jdbc', zhuanhuan: 'oggConvert'},
            { name: '任务名称5', state:'新建/运行中/删除', creatTime: '2017.11.13 12:12:12', xiaofei:'kafka', zairu: 'jdbc', zhuanhuan: 'oggConvert'},
            { name: '任务名称6', state:'新建/运行中/删除', creatTime: '2017.11.13 12:12:12', xiaofei:'kafka', zairu: 'jdbc', zhuanhuan: 'oggConvert'},
            { name: '任务名称7', state:'新建/运行中/删除', creatTime: '2017.11.13 12:12:12', xiaofei:'kafka', zairu: 'jdbc', zhuanhuan: 'oggConvert'}
        ],
        tabLoading: false,
        visible: false,
        entryServiceId: 0,
        applicationName: '',
    }

    columns = [
        {
            title: '编号',
            render: (text, record, index) => (index + 1) + ((this.state.pageNum - 1) * this.state.pageSize),
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '状态',
            dataIndex: 'state',
            key: 'state',
        },
        {
            title: '创建时间',
            dataIndex: 'creatTime',
            key: 'creatTime',
        },
        {
            title: '消费器',
            dataIndex: 'xiaofei',
            key: 'xiaofei',
        },
        {
            title: '载入器',
            dataIndex: 'zairu',
            key: 'zairu',
        },
        {
            title: '消费转换器',
            dataIndex: 'zhuanhuan',
            key: 'zhuanhuan',
        },
        {
            title: '操作',
            key: 'operator',
            render: (text, record) => {
                const items = [
                    {
                        label: '开始',
                        onClick: () => this.startItem(record),
                    },
                    {
                        label: '停止',
                        onClick: () => this.stopItem(record),
                    },
                    {
                        label: '删除',
                        onClick: () => this.deleteItem(record),
                    },
                    {
                        label: '查看',
                        onClick: () => this.handleDetail(record),
                    },
                ];
                return (<Operator items={items}/>);
            },
        },
    ];


    componentWillMount() {

    }

    /**
     * 查询
     */
    handleQuery = (formData)=> {
        const {pageSize} = this.state;
        this.setState({
            pageNum: 1,
        });
        const data = {
            size: pageSize,
            from: 0,
        }
        this.search(data);
    };

    /**
     * 重置
     * @param data
     */
    handleReset = ()=> {
        this.props.form.resetFields();
        const {pageSize} = this.state;
        this.setState({
            pageNum: 1,
        });
        const data = {
            size: pageSize,
            from: 0,
        }
        this.search(data);
    }

    /**
     * 设置时间
     */
    onOk = (value)=> {
        this.setState({
            startTimeStr: moment(value[0]).format('YYYYMMDDHHmm'),
            endTimeStr: moment(value[1]).format('YYYYMMDDHHmm'),
        });
    };

    handlePageSizeChange = (pageSize) => {
        this.setState({
            pageNum: 1,
        });
        const data = {
            size: pageSize,
            from: 0,
        };
        this.search(data);
    }

    handlePageNumChange = (value) => {
        const {pageSize} = this.state;
        this.setState({
            pageNum: value,
        });
        const data = {
            size: pageSize,
            from: value,
        };
        this.search(data);
    }

    handleAddTask = () => {
        browserHistory.push('/addtask');
    }

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {dataSource, total, pageNum, pageSize, tabLoading, visible, entryServiceId, startTimeStr, endTimeStr, applicationName} =this.state;
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
                                    label="任务名称">
                                    {getFieldDecorator('entryServiceName')(
                                        <Input placeholder="请填写任务名称" style={{width: '100%'}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="创建时间">
                                    <RangePicker
                                        showTime
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD HH:mm"
                                        placeholder={['Start Time', 'End Time']}
                                        defaultValue={[moment().add(-48,'hour'), moment()]}
                                        onOk={this.onOk}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={7} style={{textAlign:'right'}}>
                                <FormItem
                                    label=""
                                    colon={false}>
                                    <Button type="primary" onClick={() => this.handleAddTask()}
                                            style={{marginLeft: 15}}><FontIcon type="plus"/>新增任务</Button>
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
                        rowKey={(record) => record.name}
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
    }
    ;
}
export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
