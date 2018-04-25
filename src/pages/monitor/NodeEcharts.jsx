/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Radio, Spin, Button} from 'antd';
import {promiseAjax} from 'sx-ui';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import connectComponent from '../../redux/store/connectComponent';
import ReactEcharts from 'echarts-for-react';
import {formatdetailTime1} from '../common/getTime';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/nodeecharts';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        dataSource: [],
        timeNumber: 10,
    }

    getOption = () => {
        const {dataSource} =this.state;
        return {
            title: {
                text: '堆叠区域图'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['告警次数', 'TPS']
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: dataSource.xAxisData,
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: '告警次数',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {normal: {}},
                    data: dataSource.alarmNumber,
                },
                {
                    name: 'TPS',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {normal: {}},
                    data: dataSource.tps,
                },
            ]
        };
    };

    componentDidMount() {
        this.getMonitorDetail(10);
    }

    getMonitorDetail = (timeNumber)=> {
        const {jobmonitor} = this.props;
        this.setState({spinLoading: true});
        const params = {
            nodeId: jobmonitor.nodeId,
            intervalTime: timeNumber,
            intervalCount: 0
        }
        promiseAjax.get(`/mrnodesmonitor/nodeMonitor`, params).then(rsp => {
            if (rsp.success && rsp.data != undefined) {
                for (let key in rsp.data.xAxisData) {
                    rsp.data.xAxisData[key] = formatdetailTime1(rsp.data.xAxisData[key]);
                }
                this.setState({
                    dataSource: rsp.data,
                    timeNumber,
                    spinLoading: false,
                });
            }
        }).finally(() => {
        });
    };

    /**
     * 修改查看条件
     */
    searchChange = (e)=> {
        this.getMonitorDetail(e.target.value);
    };

    /**
     * 刷新
     */
    handleRefresh = () => {
        const {timeNumber} = this.state;
        this.getMonitorDetail(timeNumber);
    };

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
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
                <div className="search-monitor">
                    <RadioGroup defaultValue="10" onChange={this.searchChange}>
                        <RadioButton value="10">10分钟</RadioButton>
                        <RadioButton value="30">半个小时</RadioButton>
                        <RadioButton value="60">1个小时</RadioButton>
                        <RadioButton value="480">8个小时</RadioButton>
                        <RadioButton value="1440">24个小时</RadioButton>
                    </RadioGroup>
                    <Button type="primary" onClick={()=>this.handleRefresh()} style={{marginLeft: 15}}><FontIcon
                        type="fa-refresh"/> 刷新</Button>
                </div>
                <Spin spinning={this.state.spinLoading}>
                    <ReactEcharts
                        option={this.getOption()}
                        style={{height: '350px', width: '100%'}}
                        className='react_for_echarts'/>
                </Spin>
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
