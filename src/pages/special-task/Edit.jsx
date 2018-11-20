import React, {Component} from 'react';
import {Row, Col, Input, Button, message, Form} from 'antd';
import {promiseAjax} from 'sx-ui';
import {PageContent} from 'sx-ui/antd';
import JSONEditor from 'jsoneditor';
import {browserHistory} from 'react-router';
import 'jsoneditor/dist/jsoneditor.min.css';
import './style.less';


export const PAGE_ROUTE = '/specialTask/+edit/:id';

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
    };

    componentWillMount() {

    }

    /* eslint-disable */

    componentDidMount() {
        const {id} = this.props.params;
        const isEdit = id !== ':id';

        this.setState({isEdit});

        this.jsonEditor = new JSONEditor(this.jsonEditorContainer);

        if (isEdit) {
            this.setState({gettingJob: true});
            promiseAjax.get(`/jobtasks/${id}`)
                .then(res => {
                    if (res.success) {
                        const {jobName, jobXmlText, jobJsonText} = res.data;
                        const xml = window.decodeURIComponent(jobXmlText);
                        const json = window.JSON.parse(jobJsonText);

                        json.status = 'NEW';

                        this.props.form.setFieldsValue({jobName});
                        this.setState({xml, editId: json.taskId});
                        this.jsonEditor.set(json);
                        this.jsonEditor.expandAll();

                        if (xml === null || xml === 'null') {
                            this.setState({toJsonClicked: true, disableXML: true});
                        }

                    } else {
                        message.error('获取数据失败！');
                    }
                }).finally(() => this.setState({gettingJob: false}));
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

    handleXmlToJson = () => {
        const {xml} = this.state;
        const result = window.encodeURIComponent(xml);

        this.setState({toJsonLoading: true});
        promiseAjax.post('/jobtasks/dealspecialjson', {jobXmlText: result}).then(res => {
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
    };

    handleSave = () => {
        const {form: {getFieldValue}, params: {id}} = this.props;
        const {xml, isEdit, editId} = this.state;
        const jobXmlText = window.encodeURIComponent(xml);

        const json = this.jsonEditor.get();
        const jobJsonText = window.JSON.stringify(json);

        const jobName = getFieldValue('jobName');
        const params = {jobXmlText, jobJsonText};

        if (jobName) params.jobName = jobName;
        this.setState({saving: true});

        if (isEdit) {
            if (json.taskId !== editId) {
                message.error('任务id不允许修改！');
            } else {
                params.id = id;
                promiseAjax.put('/jobtasks/updatespecial', params).then(res => {
                    if (!res.success) {
                        return message.error(res.message || '保存失败！');
                    }
                    message.success('保存成功！', 1, () => browserHistory.goBack());
                }).finally(() => this.setState({saving: false}));
            }
        } else {
            promiseAjax.post('/jobtasks/addspecial', params).then(res => {
                if (!res.success) {
                    return message.error(res.message || '保存失败！');
                }
                message.success('保存成功！', 1, () => browserHistory.goBack());
            }).finally(() => this.setState({saving: false}));
        }
    };

    render() {
        const {xml, editorHeight, toJsonClicked, isEdit, disableXML} = this.state;
        const {form: {getFieldDecorator}} = this.props;
        return (
            <PageContent className="special-task">
                <Form
                    style={{marginBottom: 8}}
                    layout="inline"
                    onSubmit={this.handleSubmit}
                >
                    <FormItem
                        label="任务名称"
                    >
                        {getFieldDecorator('jobName', {
                            rules: [
                                {required: false, message: '请输入任务名称'},
                            ],
                        })(
                            <Input disabled={isEdit} placeholder="请输入任务名称"/>
                        )}
                    </FormItem>
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
                                disabled={disableXML}
                                type="primary"
                                onClick={this.handleXmlToJson}
                            >解析为JSON</Button>
                        </div>
                    </Col>
                    <Col span={12} style={{paddingLeft: 8}}>
                        <div style={{height: editorHeight}} ref={node => this.jsonEditorContainer = node}/>
                        <div className="editor-tools-bar" style={{textAlign: 'left'}}>
                            <Button
                                disabled={!toJsonClicked}
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
