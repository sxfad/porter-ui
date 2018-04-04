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

export const PAGE_ROUTE = '/synchtaskDetail';
@Form.create()
export class LayoutComponent extends Component {
    state = {};

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

    componentWillMount() {

    }

    render() {
        const {taskInfo} =this.props;
        const labelStyle = {
            textAlign: 'right',
            marginBottom: 18,
            fontWeight: 'bold',
        };

        const expandedRowRender = (id) => {
            let dataColumn = [];
            for (let i = 0; i < taskInfo.tables.length; i++) {
                if (taskInfo.tables[i].id === id) {
                    dataColumn = taskInfo.tables[i].fields;
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
        return (
            <div className="steps5-content">
                <div className="sub-title">任务详情</div>
                <Row>
                    <Col span={24}>
                        <Row>
                            <Col span={3} style={labelStyle}>
                                任务名称：
                            </Col>
                            <Col span={9}>
                                {taskInfo.jobName != '' ? taskInfo.jobName : '暂无'}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={3} style={labelStyle}>
                                消费插件：
                            </Col>
                            <Col span={9}>
                                {taskInfo.sourceConsumeAdt != '' ? taskInfo.sourceConsumeAdt : '暂无'}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={3} style={labelStyle}>
                                消费转换插件：
                            </Col>
                            <Col span={9}>
                                {taskInfo.sourceConvertAdt && taskInfo.sourceConvertAdt}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={3} style={labelStyle}>
                                元数据表组：
                            </Col>
                            <Col span={9}>
                                {taskInfo.sourceDataTablesName && taskInfo.sourceDataTablesName}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={3} style={labelStyle}>
                                同步数据来源:
                            </Col>
                            <Col span={9}>
                                {taskInfo.sourceDataName && taskInfo.sourceDataName}
                            </Col>
                        </Row>

                        <Row>
                            <Col span={3} style={labelStyle}>
                                载入插件:
                            </Col>
                            <Col span={9}>
                                {taskInfo.targetLoadAdt && taskInfo.targetLoadAdt}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={3} style={labelStyle}>
                                目标数据表组:
                            </Col>
                            <Col span={9}>
                                {taskInfo.targetDataTablesName && taskInfo.targetDataTablesName}
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24}>
                        <div className="sub-title">数据映射关系</div>
                        <Table
                            size="middle"
                            rowKey={(record) => record.sourceTableName}
                            columns={this.Columns}
                            dataSource={taskInfo.tables}
                            expandedRowRender={(record) => expandedRowRender(record.id)}
                            pagination={false}
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}
export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
