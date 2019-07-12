import React, {Component} from 'react';
import {Row, Col, Input, Button, message, Form} from 'antd';
import {promiseAjax} from 'sx-ui';
import {PageContent} from 'sx-ui/antd';
import JSONEditor from 'jsoneditor';
import {browserHistory} from 'react-router';
import 'jsoneditor/dist/jsoneditor.min.css';
import './style.less';


export const PAGE_ROUTE = '/publicDataSource/+edit/:id';

const {TextArea} = Input;
const FormItem = Form.Item;

@Form.create()
export default class Edit extends Component {
    state = {
        xml: '',
        json: '',
        editorHeight: 500,
        toJsonLoading: false,
        saving: false,
        toJsonClicked: false,
        isEdit: false,
        gettingJob: false,
        editId: '',
        disableXML: false,
        disable: false
    };

    componentWillMount() {

    }

    /* eslint-disable */

    componentDidMount() {
        const {id} = this.props.params;
        const isEdit = id !== ':id';
        console.log(id,'iggggg');
        this.setState({isEdit});

        this.jsonEditor = new JSONEditor(this.jsonEditorContainer);
        if (isEdit) {
            this.setState({gettingJob: true});
            promiseAjax.get(`/pdse/${id}`)
                .then(res => {
                    if (res.success) {

                        const {name,declares,xmlText, jsonText,code} = res.data;
                        const xml = window.decodeURIComponent(xmlText);
                        const json = window.JSON.parse(jsonText) || {};
                        console.log(json,'json');
                        json.status = 'new';
                        this.props.form.setFieldsValue({name,declares, code});
                        this.setState({xml,editId: json.taskId});
                        this.jsonEditor.set(json);
                        this.jsonEditor.expandAll();

                        if (xml === null || xml === 'null') {
                            this.setState({toJsonClicked: true,disableXML: false,});
                        }

                    } else {
                        message.error('获取数据失败！');
                    }
                }).finally(() => this.setState({disable: true,gettingJob: false}));
        } else {
            // this.jsonEditor.set({});
            // const json = this.jsonEditor.get();
        }
        this.setEditorHeight();
        window.addEventListener('resize', this.setEditorHeight);
    }

    /* eslint-enable */

    componentWillUnmount() {
        this.jsonEditor.destroy();
        window.removeEventListener('resize', this.setEditorHeight);
    }

    setEditorHeight = () => {
        const wHeight = window.innerHeight;
        const otherHeight = 155 + 50; // 头部 + 底部
        this.setState({editorHeight: wHeight - otherHeight});
    };

    handleXmlChange = (e) => {
        const {value} = e.target;
        this.setState({xml: value, toJsonClicked: false});
    };

    handleXmlToJson = (e) => {
        e.preventDefault();

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const {xml} = this.state;
                const result = window.encodeURIComponent(xml);

                this.setState({toJsonLoading: true});
                promiseAjax.post('/pdse/dealxml', {xmlText: result, code:values.code}).then(res => {
                    if (res.success && res.data) {
                        message.success('转换成功！');
                        res.data.status = 'NEW';
                        this.setState({json: res.data, toJsonClicked: true});
                        this.jsonEditor.set(res.data);
                        this.jsonEditor.expandAll();
                    } else {
                        message.error('转换失败！');
                        this.setState({json: ''});
                        this.jsonEditor.set({});
                    }
                }).finally(() => this.setState({tabLoading: false}));
            }
        })
    };

    handleSave = (e) => {
        e.preventDefault();

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const {form: {getFieldValue}, params: {id}} = this.props;
                const {xml, isEdit, editId} = this.state;
                const xmlText = window.encodeURIComponent(xml);

                const json = this.jsonEditor.get();
                const jsonText = window.JSON.stringify(json);
                const name = getFieldValue('name');
                const code = getFieldValue('code');
                const declares = getFieldValue('declares');
                const params = {name,code,declares,xmlText, jsonText};

                this.setState({saving: true});

                if (isEdit) {
                    // if (json.taskId !== editId) {
                    //     message.error('任务id不允许修改！');
                    // } else {
                    params.id = id;
                    promiseAjax.put(`/pdse/${id}`, params)
                        .then(res => {
                            console.log(res,"res.edit")
                            if (!res.success) {
                                return message.error(res.message || '保存失败！');
                            }
                            message.success('保存成功！', 1, () => browserHistory.goBack());
                        }).finally(() => this.setState({saving: false}));
                    // }
                } else {
                    promiseAjax.post('/pdse', params).then(res => {
                        if (!res.success) {
                            return message.error(res.message || '保存失败！');
                        }
                        message.success('保存成功！', 1, () => browserHistory.goBack());
                    }).finally(() => this.setState({saving: false}));
                }
            }
        })
    };

    render() {
        const {xml, editorHeight, toJsonClicked, disable, disableXML} = this.state;
        const {form: {getFieldDecorator}} = this.props;
        return (
            <PageContent className="special-task">
                <Form
                    style={{marginBottom: 8}}
                    layout="inline"
                    onSubmit={this.handleSubmit}
                >
                    <FormItem
                        label="数据源名称"
                    >
                        {getFieldDecorator('name', {
                            rules: [
                                {required: true, message: '请输入数据源名称'},
                            ],
                        })(
                            <Input  placeholder="请输入数据源名称"/>
                        )}
                    </FormItem>
                    <Col span={24}>
                        <FormItem
                            label="数据源识别码"
                        >
                            {getFieldDecorator('code', {
                                initialValue: null,
                                rules: [
                                    {required: true, message: '请输入数据源识别码'},
                                ],
                            })(
                                <Input disabled={disable}  placeholder="请输入数据源识别码"/>
                            )}
                        </FormItem>
                    </Col>
                    <Row style={{marginTop:15}}>
                        <Col>
                            <FormItem
                                label="数据源详细解释"
                            >
                                {getFieldDecorator('declares', {
                                    // rules: [
                                    //     {required: false, message: '请输入数据源解释'},
                                    // ],
                                })(
                                    <Input  placeholder="请输入数据源解释"  style={{width:900}}/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>

                <Row>
                    <Col span={12} style={{paddingRight: 8}}>
                        <div className="xml-editor-title">编辑Properties</div>
                        <TextArea
                            disabled={disableXML}
                            className="xml-editor"
                            style={{height: editorHeight - 35}}
                            value={xml}
                            onChange={this.handleXmlChange}
                        />
                        <div className="editor-tools-bar">
                            <Button
                                type="primary"
                                onClick={this.handleXmlToJson}
                            >解析为JSON</Button>
                        </div>
                    </Col>
                    <Col span={12} style={{paddingLeft: 8,paddingTop: 0}}>
                        <div style={{height: editorHeight}} ref={node => this.jsonEditorContainer = node}/>
                        <div className="editor-tools-bar" style={{textAlign: 'left'}}>
                            <Button
                                type="primary"
                                onClick={this.handleSave}
                            >保存</Button>
                        </div>
                    </Col>
                </Row>
            </PageContent>
        );
    }
}
