/**
 * Created by lhyin on 209/14/3.
 */
import React, {Component} from 'react';
import {Form, Button, Row, Col, Table} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {formatDefaultTime} from '../common/getTime';
import './style.less';
import connectComponent from '../../redux/store/connectComponent';

export const PAGE_ROUTE = '/synchtask/+detail/:TaskId';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        taskData: [],
        userStr: '',
    };

    Columns = [
        {
            title: '源表名',
            render: (text, record) => {
                return (
                    record.sourceTableName
                );
            },

        },
        {
            title: '目标表名',
            render: (text, record) => {
                return (
                    record.targetTableName
                );
            },

        },
    ]

    componentDidMount() {
        const {params: {TaskId}} = this.props;
        if (TaskId != 'TaskId') {
            promiseAjax.get(`/jobtasks/${TaskId}`).then(rsp => {
                let userStr = '';
                if (rsp.success) {
                    for (let i = 0; i < rsp.data.users.length; i++) {
                        userStr = userStr + rsp.data.users[i].loginname + ',';
                    }
                    this.setState({
                        taskData: rsp.data,
                        userStr: userStr.substring(0, userStr.length - 1),
                    });
                }
            });
        }
    }

    render() {
        const {taskData} =this.state;
        const expandedRowRender = (id) => {
            let dataColumn = [];
            for (let i = 0; i < taskData.tables.length; i++) {
                if (taskData.tables[i].id === id) {
                    dataColumn = taskData.tables[i].fields;
                }
            }
            const columns = [
                {title: '源表列名', dataIndex: 'sourceTableField', key: 'sourceTableField'},
                {title: '目标表列名', dataIndex: 'targetTableField', key: 'targetTableField'},
            ];
            return (
                <Table
                    columns={columns}
                    dataSource={dataColumn}
                    rowKey={(record) => record.id}
                    pagination={false}
                />
            );
        };


        const labelStyle = {
            textAlign: 'right',
            marginBottom: 18,
            fontWeight: 'bold',
        };
        return (
            <PageContent>
                <div>
                    <div className="sub-title">任务详情</div>
                    <Row>
                        <Col span={24}>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    任务名称：
                                </Col>
                                <Col span={9}>
                                    {taskData.jobName && taskData.jobName}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    告警通知人：
                                </Col>
                                <Col span={9}>
                                    {this.state.userStr}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    消费插件：
                                </Col>
                                <Col span={9}>
                                    {taskData.sourceConsumeAdt && taskData.sourceConsumeAdt.name}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    消费转换插件：
                                </Col>
                                <Col span={9}>
                                    {taskData.sourceConvertAdt && taskData.sourceConvertAdt.name}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    元数据表组：
                                </Col>
                                <Col span={9}>
                                    {taskData.sourceDataTablesName && taskData.sourceDataTablesName}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    同步数据来源：
                                </Col>
                                <Col span={9}>
                                    {taskData.sourceDataName && taskData.sourceDataName}
                                </Col>
                            </Row>

                            <Row>
                                <Col span={3} style={labelStyle}>
                                    载入插件：
                                </Col>
                                <Col span={9}>
                                    {taskData.targetLoadAdt && taskData.targetLoadAdt.name}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    目标数据表组：
                                </Col>
                                <Col span={9}>
                                    {taskData.targetDataTablesName && taskData.targetDataTablesName}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    状态：
                                </Col>
                                <Col span={9}>
                                    <span className="green-text">{taskData.jobState && taskData.jobState.name}</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} style={labelStyle}>
                                    创建时间：
                                </Col>
                                <Col span={9}>
                                    { formatDefaultTime(taskData.createTime) }
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24}>
                            <div className="sub-title">数据映射关系</div>
                            <Table
                                size="middle"
                                rowKey={(record) => record.sourceTableName}
                                columns={this.Columns}
                                dataSource={taskData.tables}
                                pagination={false}
                                expandedRowRender={(record) => expandedRowRender(record.id)}
                            />
                        </Col>
                        <Col span={24} style={{paddingTop:20}}>
                            <Row>
                                <Col span={9}>
                                    <Button type="primary" onClick={() => { history.back(); }} size="large">返回</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </PageContent>
        )
    }
}
export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
