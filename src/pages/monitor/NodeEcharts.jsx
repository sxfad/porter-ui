/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Radio} from 'antd';
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
    }

    getOption = () => {
        const {dataSource} =this.state;
        for (let key in dataSource.xAxisData) {
            dataSource.xAxisData[key] = formatdetailTime1(dataSource.xAxisData[key]);
        }
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
        console.log(jobmonitor);

        const params = {
            nodeId: jobmonitor.nodeId,
            intervalTime: timeNumber,
            intervalCount: 0
        }
        promiseAjax.get(`/mrnodesmonitor/nodeMonitor`, params).then(rsp => {
            if (rsp.success && rsp.data != undefined) {
                this.setState({
                    dataSource: rsp.data,
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
                    </RadioGroup>
                </div>
                <ReactEcharts
                    option={this.getOption()}
                    style={{height: '350px', width: '100%'}}
                    className='react_for_echarts'/>
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
