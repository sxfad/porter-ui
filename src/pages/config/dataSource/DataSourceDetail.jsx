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

export const PAGE_ROUTE = '/dataSource/+detail/:dataSourceId';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        dataSource: [],
    };

    componentWillMount() {
        const {params: {dataSourceId}} = this.props;
        if (dataSourceId != 'DataSourceId') {
            promiseAjax.get(`/datasource/${dataSourceId}`).then(rsp => {
                if (rsp.success) {
                    this.setState({
                        dataSource: rsp.data,
                    });
                }
            });
        }
    }

    render() {
        const {dataSource} =this.state;

        const labelStyle = {
            textAlign: 'right',
            marginBottom: 18,
            fontWeight: 'bold',
        };
        var formItemsHtml = [];
        var plugins = dataSource.plugins;
        if(plugins != undefined){
            plugins.map((k, index) => {
                formItemsHtml.push(
                    <Row key={plugins[index].fieldCode}>
                        <Col span={6} style={labelStyle}>
                            {plugins[index].fieldName}：
                        </Col>
                        <Col span={18}>
                            {plugins[index].fieldValue}
                        </Col>
                    </Row>
                )
            });
        }

        return (
            <PageContent>
                <div>
                    <div className="sub-title">数据源详情</div>
                    <Row>
                        <Col span={12}>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                    数据源名称：
                                </Col>
                                <Col span={18}>
                                    {dataSource.name != '' ? dataSource.name : '暂无'}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                    数据源类型：
                                </Col>
                                <Col span={18}>
                                    {dataSource.name && dataSource.dataType.name}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={6} style={labelStyle}>
                                    创建时间：
                                </Col>
                                <Col span={18}>
                                    {formatDefaultTime(dataSource.createTime)}
                                </Col>
                            </Row>
                            {formItemsHtml}
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
