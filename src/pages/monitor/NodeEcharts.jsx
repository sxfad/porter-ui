/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Radio, Spin, Button, DatePicker} from 'antd';
import {promiseAjax} from 'sx-ui';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import connectComponent from '../../redux/store/connectComponent';
import ReactEcharts from 'echarts-for-react';
import {formatdetailTime1} from '../common/getTime';
import moment from "moment";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/nodeecharts';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        dataSource: [],
        timeNumber: '10',
        isShowNowDate: 'block',
        isShowOtherDate: 'none',
        date: moment(new Date(), 'YYYY/MM/DD'),
    };

    getOption = () => {
        const {dataSource} =this.state;
        return {
            title: {
                // text: '堆叠区域图'
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
                    // areaStyle: {normal: {}},
                    data: dataSource.alarmNumber,
                    smooth: true
                },
                {
                    name: 'TPS',
                    type: 'line',
                    stack: '总量',
                    // areaStyle: {normal: {}},
                    data: dataSource.tps,
                    smooth: true
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
            intervalCount: 0,
            date: moment(new Date()).format("YYYY-MM-DD")
        };
        promiseAjax.get(`/mrnodesmonitor/nodeMonitorDetail`, params).then(rsp => {
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

    // 改变日期选框
    handleChangeDate = (e) => {
        const todayDate = moment(new Date()).format("YYYY-MM-DD");
        const newDate = moment(e).format('YYYY-MM-DD');
        const {jobmonitor} = this.props;
        const {timeNumber} = this.state;
        let params = {};

        // 同一天时 才发送 intervalTime
        if(todayDate === newDate) {
            params = {
                nodeId: jobmonitor.nodeId,
                intervalTime: timeNumber,
                intervalCount: 0,
                date: todayDate,
            };
            this.setState({
                isShowNowDate: 'block',
                isShowOtherDate: 'none',
                date: todayDate,
            });
        } else {
            params = {
                nodeId: jobmonitor.nodeId,
                intervalCount: 0,
                date: newDate,
            };
            this.setState({
                isShowNowDate: 'none',
                isShowOtherDate: 'block',
                date: newDate,
            });
        }

        promiseAjax.get(`/mrnodesmonitor/nodeMonitorDetail`, params).then(rsp => {
            console.log(rsp);
            if (rsp.success && rsp.data !== undefined) {
                for (let key in rsp.data.xAxisData) {
                    rsp.data.xAxisData[key] = formatdetailTime1(rsp.data.xAxisData[key]);
                }
                this.setState({
                    dataSource: rsp.data,
                    timeNumber,
                    spinLoading: false
                });
            }
        })
    };

    /**
     * 修改查看条件
     */
    searchChange = (e) => {
        this.getMonitorDetail(e.target.value);
        this.setState({timeNumber: e.target.value});
    };

    /**
     * 刷新
     */
    handleRefresh = () => {
        const {timeNumber, date} = this.state;
        const {jobmonitor} = this.props;
        const now = moment(date).format('YYYY-MM-DD');
        const todayDate = moment(new Date()).add('year',0).format("YYYY-MM-DD");
        let params = {};

        if(now === todayDate) {
            params = {
                nodeId: jobmonitor.nodeId,
                intervalTime: timeNumber,
                intervalCount: 0,
                date: now,
            };
        } else {
            params = {
                nodeId: jobmonitor.nodeId,
                intervalCount: 0,
                date: now,
            };
        }

        promiseAjax.get(`/mrnodesmonitor/nodeMonitorDetail`, params).then(rsp => {
            console.log(rsp);
            if (rsp.success && rsp.data !== undefined) {
                for (let key in rsp.data.xAxisData) {
                    rsp.data.xAxisData[key] = formatdetailTime1(rsp.data.xAxisData[key]);
                }
                this.setState({
                    dataSource: rsp.data,
                    timeNumber,
                    spinLoading: false
                });
            }
        })
    };

    render() {
        const {form: {getFieldDecorator, getFieldsValue}} = this.props;
        const {isShowNowDate, isShowOtherDate} = this.state;
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
                    <DatePicker
                        style={{float: 'left', marginRight: 16}}
                        defaultValue={this.state.date}
                        format={'YYYY/MM/DD'}
                        allowClear={false}
                        onChange={this.handleChangeDate}
                    />
                    <RadioGroup defaultValue={this.state.timeNumber} onChange={this.searchChange} style={{float: 'left', display: isShowNowDate}}>
                        <RadioButton value="10">10分钟</RadioButton>
                        <RadioButton value="30">半个小时</RadioButton>
                        <RadioButton value="60">1个小时</RadioButton>
                        <RadioButton value="480">8个小时</RadioButton>
                        <RadioButton value="1440">24个小时</RadioButton>
                    </RadioGroup>
                    <RadioGroup defaultValue={''} onChange={this.searchChange} disabled={true} style={{float: 'left', display: isShowOtherDate}}>
                        <RadioButton value="10">10分钟</RadioButton>
                        <RadioButton value="30">半个小时</RadioButton>
                        <RadioButton value="60">1个小时</RadioButton>
                        <RadioButton value="480">8个小时</RadioButton>
                        <RadioButton value="1440">24个小时</RadioButton>
                    </RadioGroup>
                    <Button type="primary" onClick={()=>this.handleRefresh()} style={{marginLeft: 15}}><FontIcon
                        type="fa-refresh"/> 刷新</Button>
                </div>
                <ReactEcharts
                    option={this.getOption()}
                    style={{height: '340px', width: '100%',top: 20}}
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
