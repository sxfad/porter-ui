/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Radio, Button, Spin, DatePicker} from 'antd';
import {promiseAjax} from 'sx-ui';
import moment from 'moment'
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import connectComponent from '../../redux/store/connectComponent';
import ReactEcharts from 'echarts-for-react';
import {formatdetailTime1} from '../common/getTime';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/echarts';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        dataSource: [],
        timeNumber: '10',
        spinLoading: false,
        date: moment(new Date(), 'YYYY/MM/DD'),
        isShowNowDate: 'block',
        isShowOtherDate: 'none',
    }

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
                data: ['告警次数', '插入成功', '插入失败', '更新成功', '更新失败', '删除成功', '删除失败']
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
                    name: '插入成功',
                    type: 'line',
                    stack: '总量',
                    // areaStyle: {normal: {}},
                    data: dataSource.insertSucces,
                    smooth: true
                },
                {
                    name: '插入失败',
                    type: 'line',
                    stack: '总量',
                    // areaStyle: {normal: {}},
                    data: dataSource.insertFailure,
                    smooth: true
                },
                {
                    name: '更新成功',
                    type: 'line',
                    stack: '总量',
                    // areaStyle: {normal: {}},
                    data: dataSource.updateSucces,
                    smooth: true
                },
                {
                    name: '更新失败',
                    type: 'line',
                    stack: '总量',
                    // areaStyle: {normal: {}},
                    data: dataSource.updateFailure,
                    smooth: true
                },
                {
                    name: '删除成功',
                    type: 'line',
                    stack: '总量',
                    // areaStyle: {normal: {}},
                    data: dataSource.deleteSucces,
                    smooth: true
                },
                {
                    name: '删除失败',
                    type: 'line',
                    stack: '总量',
                    // areaStyle: {normal: {}},
                    data: dataSource.deleteFailure,
                    smooth: true
                }
            ]
        };
    };

    componentDidMount() {
        this.getMonitorDetail(10);
    }

    // 新增查询日期
    getMonitorDetail = (timeNumber)=> {
        this.setState({spinLoading: true});
        const {jobmonitor} = this.props;
        const date = moment(new Date()).format("YYYY-MM-DD");
        const params = {
            jobId: jobmonitor.jobId,
            swimlaneId: jobmonitor.swimlaneId,
            schemaTable: jobmonitor.schemaTable,
            intervalTime: timeNumber,
            intervalCount: 0,
            monitorDate: date
        };
        promiseAjax.get(`/mrjobtasksmonitor/jobMonitorDetail`, params).then(rsp => {
            if (rsp.success && rsp.data != undefined) {
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
    searchChange = (e)=> {
        this.getMonitorDetail(e.target.value);
        this.setState({timeNumber: e.target.value});
    };

    // 改变日期选框
    handleChangeDate = (e) => {
        const todayDate = moment(new Date()).add('year',0).format("YYYY-MM-DD");
        const newDate = moment(e).format('YYYY-MM-DD');
        const {jobmonitor} = this.props;
        let params = {};

        // 只有同一天时 才发送 intervalTime
        if(todayDate === newDate) {
            params = {
                jobId: jobmonitor.jobId,
                swimlaneId: jobmonitor.swimlaneId,
                schemaTable: jobmonitor.schemaTable,
                intervalCount: 0,
                intervalTime: this.state.timeNumber,
                monitorDate: todayDate,
            };
            this.setState({
                isShowNowDate: 'block',
                isShowOtherDate: 'none',
                date: todayDate,
            });
        } else {
            params = {
                jobId: jobmonitor.jobId,
                swimlaneId: jobmonitor.swimlaneId,
                schemaTable: jobmonitor.schemaTable,
                intervalCount: 0,
                monitorDate: newDate,
            };
            this.setState({
                isShowNowDate: 'none',
                isShowOtherDate: 'block',
                date: newDate,
            });
        }

        promiseAjax.get(`/mrjobtasksmonitor/jobMonitorDetail`, params).then(rsp => {
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
                jobId: jobmonitor.jobId,
                swimlaneId: jobmonitor.swimlaneId,
                schemaTable: jobmonitor.schemaTable,
                intervalCount: 0,
                intervalTime: this.state.timeNumber,
                monitorDate: now
            };
        } else {
            params = {
                jobId: jobmonitor.jobId,
                swimlaneId: jobmonitor.swimlaneId,
                schemaTable: jobmonitor.schemaTable,
                intervalCount: 0,
                monitorDate: now
            };
        }

        promiseAjax.get(`/mrjobtasksmonitor/jobMonitorDetail`, params).then(rsp => {
            console.log(rsp);
            if (rsp.success && rsp.data != undefined) {
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
        const {interval, isShowNowDate, isShowOtherDate, timeNumber} = this.state;
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
                    <DatePicker
                        style={{float: 'left', marginRight: 16}}
                        defaultValue={this.state.date}
                        format={'YYYY/MM/DD'}
                        allowClear={false}
                        onChange={this.handleChangeDate}
                    />
                    <RadioGroup defaultValue={timeNumber} onChange={this.searchChange} style={{float: 'left', display: isShowNowDate}}>
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
                    style={{height: 340, width: '100%', top: 20}}
                    className='react_for_echarts'
                />
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
