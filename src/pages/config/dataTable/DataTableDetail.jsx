/**
 * Created by lhyin on 2018/14/3.
 */
import React, {Component} from 'react';
import {Form, Button, Row, Col} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {formatDefaultTime} from '../../common/getTime';
import './style.less';
import connectComponent from '../../../redux/store/connectComponent';

export const PAGE_ROUTE = '/dataTable/+detail/:DataTableId';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        dataTable: [],
    };

    componentWillMount() {
        const {params: {DataTableId}} = this.props;
        if (DataTableId != 'DataTableId') {
            promiseAjax.get(`/datatable/${DataTableId}`).then(rsp => {
                console.log(rsp);
                if (rsp.success) {
                    this.setState({
                        dataTable: rsp.data,
                    });
                }
            });
        }
    }

    render() {
        const {dataTable} =this.state;

        const labelStyle = {
            textAlign: 'right',
            marginBottom: 18,
            fontWeight: 'bold',
        };

        return (
            <PageContent>
                <div>
                    <div className="sub-title">数据源详情</div>
                    <Row>
                        <Col span={12}>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                    分组名称：
                                </Col>
                                <Col span={18}>
                                    {dataTable.bankName != '' ? dataTable.bankName : '暂无'}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                    数据源名称：
                                </Col>
                                <Col span={18}>
                                    {dataTable.sourceId && dataTable.sourceName}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                    数据源类型：
                                </Col>
                                <Col span={18}>
                                    {dataTable.dataType && dataTable.dataType}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                    数据表：
                                </Col>
                                <Col span={18}>
                                    {dataTable.tableName && dataTable.tableName}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                    创建时间：
                                </Col>
                                <Col span={18}>
                                    {formatDefaultTime(dataTable.createTime)}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                </Col>
                                <Col span={18}>
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
