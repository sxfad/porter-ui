/**
 * Created by lhyin on 2018/11/4.
 */
import React, {Component} from 'react';
import {Form, Radio, Button, Spin} from 'antd';
import {promiseAjax} from 'sx-ui';
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
        timeNumber: 10,
        spinLoading: false,
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
                    areaStyle: {normal: {}},
                    data: dataSource.alarmNumber,
                },
                {
                    name: '插入成功',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {normal: {}},
                    data: dataSource.insertSucces,
                },
                {
                    name: '插入失败',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {normal: {}},
                    data: dataSource.insertFailure
                },
                {
                    name: '更新成功',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {normal: {}},
                    data: dataSource.updateSucces
                },
                {
                    name: '更新失败',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {normal: {}},
                    data: dataSource.updateFailure
                },
                {
                    name: '删除成功',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {normal: {}},
                    data: dataSource.deleteSucces
                },
                {
                    name: '删除失败',
                    type: 'line',
                    stack: '总量',
                    areaStyle: {normal: {}},
                    data: dataSource.deleteFailure
                }
            ]
        };
    };

    componentDidMount() {
        this.getMonitorDetail(10);
    }

    getMonitorDetail = (timeNumber)=> {
        this.setState({ spinLoading: true });
        const {jobmonitor} = this.props;
        const params = {
            jobId: jobmonitor.jobId,
            swimlaneId: jobmonitor.swimlaneId,
            intervalTime: timeNumber,
            intervalCount: 0
        }
        promiseAjax.get(`/mrjobtasksmonitor/jobmonitor`, params).then(rsp => {
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
