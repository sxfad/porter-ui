import React, {Component} from 'react';
import {Form, Input, Button, Row, Col, Select, Tag, Tooltip, Icon, message} from 'antd';
import {PageContent, FontIcon} from 'sx-ui/antd';
import {promiseAjax} from 'sx-ui';
import connectComponent from "../../../redux/store/connectComponent";
import {browserHistory} from "react-router";

export const PAGE_ROUTE = "/PermissionSet/:id";
const FormItem = Form.Item;
const Option = Select.Option;
@Form.create()
export class LayoutComponent extends Component {

    state = {
        butValue: null,
        tags: [],
        inputVisible: false,
        inputValue: null,
        objectId: null,
        dataSignEnum: null,
        btns: [],
        ownerName: null,
        selectData: [],
        data: [],
        path: null
    };

    /**
     * 获取页面组装数据
     */
    componentDidMount () {
       this.pageData();
       //获取责任人，共享者数据
        promiseAjax.get(`/cuser/findRegister`).then(
            res => {
                this.setState({
                    selectData: res.data
                });
            }
        );
    }


    pageData = (val) => {
        let objectId = this.props.params.id;
        let dataSignEnum = this.props.location.state.dataSign.code;
        this.setState({
            objectId:this.props.params.id,
            dataSignEnum:this.props.location.state.dataSign.code,
            path: this.props.location.state.path
        });
        promiseAjax.post(`/dataauthority/dataauthorityvo?objectId=${objectId}&&dataSignEnum=${dataSignEnum}`)
            .then(rsp => {
                if (rsp.success) {
                    val ? message.success("刷新成功!") : null;
                    this.setState({
                        btns: rsp.data.btns,
                        ownerName: rsp.data.owner,
                        tags: rsp.data.shareOwner
                    });
                }
        })
    };

    /**
     * 处理数组问题
     * @param ary
     * @param val
     * @returns {Array}
     */
    aryOper = (ary,val) => {
        let arry = [];
        ary && ary.map (
            v => {
                arry.push(v[val])
            }
        );
        return arry
    };

    /**
     * 数据处理
     * @param value
     */
    dataProcessing = (value) => {
        const { selectData, ownerName} = this.state;
        let arry = ownerName
            ? selectData.filter(
                v => v.id !== this.state.ownerName.ownerId
            )
            : selectData;
        this.setState({
            data: arry,
        });
    };

    /**
     * (责任人，共享者)按钮点击事件
     * @param value
     */
    handelClick = (value) => {
        if(value === "刷新"){
            this.handleRefresh();
            return
        }else if(value === "放弃") {
            this.handelGiveUp();
            return
        }
        const {butValue} = this.state;
        if(!butValue){
            this.setState({
                butValue: value,
            });
        }else{
            this.setState({
                butValue: butValue === value ? null : value,
            })
        }
        this.dataProcessing(value)
    };

    /**
     * 责任人select
     * @param value
     * @param e
     */
    onChange = (e,value) => {
        const { objectId, dataSignEnum } = this.state;
        promiseAjax.post(`/dataauthority/turnover?ownerId=${e}&&objectId=${objectId}&&dataSignEnum=${dataSignEnum}`)
            .then(
                res => {
                    if(res.code === 200){
                        this.props.form.setFieldsValue({
                            owner: e
                        });
                        this.setState({
                            ownerName: {name:value.props.children}
                        });
                        this.pageData();
                        message.success("操作成功!")
                    }
                }
        );
    };

    /**
     * 新增(共享者显示tag标签)
     */
    showInput = () => {
        this.setState({ inputVisible: true });
    };

    /**
     * 共享者操作接口
     * @param e
     * @param val
     */
    handleInputChange = (e,val) => {
        const { objectId, dataSignEnum } = this.state;
        promiseAjax.post(`/dataauthority/addshare?ownerId=${e}&&objectId=${objectId}&&dataSignEnum=${dataSignEnum}`)
            .then(
                res => {
                    if(res.code === 200){
                        message.success("操作成功!");
                        this.setState({
                            inputValue: {
                                name:val.props.children,ownerId:parseInt(e)
                            }
                        });
                    }
                }
        );
    };

    handleInputConfirm = () => {
        const { inputValue } = this.state;
        let { tags } = this.state;
        let tag = this.aryOper(tags,"ownerId");
        if (inputValue && tag.indexOf(inputValue.ownerId) === -1) {
            tags = [...tags, inputValue];
        }
        this.setState({
            tags,
            inputVisible: false,
            inputValue: null,
        });
        this.pageData();
    };

    /**
     * 删除tages数据(共享者)
     * @param removedTag
     */
    handleClose = (removedTag) => {
        const { objectId, dataSignEnum } = this.state;
        promiseAjax.del(`/dataauthority/delshare?ownerId=${removedTag.ownerId}&&objectId=${objectId}&&dataSignEnum=${dataSignEnum}`)
            .then(
                res => {
                    if(res.code === 200) {
                        message.success("删除成功!");
                        const tags = this.state.tags.filter(tag => tag !== removedTag);
                        this.setState({ tags });
                    }
                }
        );
    };

    /**
     * 刷新
     */
    handleRefresh = () => {
        this.setState({
            butValue: null
        });
        this.pageData("刷新")
    };

    /**
     * 放弃
     */
    handelGiveUp = () => {
        const {path, objectId, dataSignEnum} = this.state;
        promiseAjax.post(`/dataauthority/waive?objectId=${objectId}&&dataSignEnum=${dataSignEnum}`)
            .then(rsp => {
                if (rsp.success) {
                    message.success("放弃成功!");
                    browserHistory.push(`${path}`);
                }
            })
    };

    render () {
        const {form: {getFieldDecorator}} = this.props;
        const { butValue, tags, inputVisible, inputValue, btns, data, ownerName, selectData, path} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 2},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };
        const queryItemLayout = {
            xs: 12,
            md: 8,
            lg: 3,
        };
        const input = {
            style:{
            border: "none",
            boxShadow: "none",
        },
            readOnly:"readonly"
        };
        const name = ownerName ? `${ownerName.name}(${ownerName.email})` : "无";
        const share = tags && tags.length <= 0 ? [{name:"无",email:"无"}] : tags;
        return (
            <PageContent>
                <div className="sub-title">
                    {`${this.props.location.state.text}(权限设置)`}
                    <Button
                        type="primary"
                        ghost
                        style={{
                            float: "right",
                            marginTop: -7,
                            display: "inline",
                            border: "none",
                            boxShadow: "none"
                        }}
                        icon="rollback"
                        onClick={
                            () => browserHistory.push(`${path}`)

                        }
                    >返回</Button>
                </div>
                <Form style={{marginTop: 40}}>
                    <Row style={{marginLeft: "4%"}} key="button">
                        {
                            btns&&btns.map(
                                item => (
                                    <Col key={item.code}
                                         style={{ marginLeft: item.code==="WAIVE" ? "50%" : null }}
                                         {...queryItemLayout}
                                    >
                                        <Button
                                            key={item.code}
                                            onClick={ () => this.handelClick(item.name)}
                                            type={ butValue === item.name ? "primary" : null}
                                        >{item.name}</Button>
                                    </Col>
                                )
                            )
                        }
                        <Col {...queryItemLayout} style={{float: "right"}} key="刷新">
                            <Button
                                key="刷新"
                                onClick={ () => this.handelClick("刷新")}
                                type={ butValue === "刷新" ? "primary" : null}
                            >刷新</Button>
                        </Col>
                    </Row>
                    <Row style={{marginTop: 50}} key={2}>
                        <Col span={24} key={1}>
                            <FormItem
                                {...formItemLayout}
                                label="责任人">
                                {getFieldDecorator('owner',{
                                    initialValue: name
                                })(
                                    butValue ==="责任人"
                                        ? <Select
                                            showSearch
                                            style={{ width: 200 }}
                                            placeholder="请选择"
                                            optionFilterProp="children"
                                            onSelect={this.onChange}
                                            filterOption={
                                                (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                          >
                                            {
                                                data.map(
                                                    item => (
                                                        <Option
                                                            key={item.id}
                                                            value={item.id.toString()}
                                                        >{`${item.nickname}`}</Option>
                                                    )
                                                )
                                            }
                                        </Select>
                                        : <Input {...input}/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24} key={2}>
                            <FormItem
                                {...formItemLayout}
                                label="共享者">
                                {getFieldDecorator('shareOwner')(
                                    butValue ==="共享者"
                                    ? <div>
                                        {
                                            tags.map(tag => {
                                                const isLongTag = tag.length > 20;
                                                const tagElem = (
                                                    <Tag
                                                        key={tag.ownerId}
                                                        closable
                                                        onClose={() => this.handleClose(tag)}
                                                    >
                                                        {isLongTag ? `${tag.name}(${tag.email})` : `${tag.name}(${tag.email})`}
                                                    </Tag>
                                                );

                                                return isLongTag
                                                        ? <Tooltip
                                                            title={tag.name}
                                                            key={tag.ownerId}
                                                          >{tagElem}</Tooltip>
                                                        : tagElem;
                                            })
                                        }
                                        {
                                            inputVisible && (
                                                <Select
                                                    showSearch
                                                    style={{ width: 200 }}
                                                    value={inputValue?inputValue.name:null}
                                                    onSelect={this.handleInputChange}
                                                    onBlur={this.handleInputConfirm}
                                                    onPressEnter={this.handleInputConfirm}
                                                >
                                                    {
                                                        selectData.map(
                                                            item => (
                                                                <Option
                                                                    key={item.id}
                                                                    value={item.id.toString()}
                                                                >{`${item.nickname}`}
                                                                </Option>
                                                            )
                                                        )
                                                    }
                                                </Select>
                                            )
                                        }
                                        {
                                            !inputVisible && (
                                                <Tag
                                                    onClick={this.showInput}
                                                    style={{ background: '#fff', borderStyle: 'dashed' }}
                                                >
                                                    <Icon type="plus" /> 新增
                                                </Tag>
                                            )
                                        }
                                    </div>
                                    : (
                                        <div>
                                            {
                                                share.map(
                                                    (v,k) => {
                                                       return <Col span={6} key={k}>
                                                           <Input {...input} key={k} value={`${v.name}(${v.email})`}/>
                                                       </Col>
                                                    }
                                                )
                                            }
                                        </div>
                                       )
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
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
