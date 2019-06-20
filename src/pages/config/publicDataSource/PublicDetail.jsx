import React, {Component} from 'react';
import {promiseAjax} from 'sx-ui';
import {PageContent} from 'sx-ui/antd';
import {message, Card} from 'antd';
import moment from 'moment';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';

export const PAGE_ROUTE = '/publicDataSource/+detail/:id';

function deleteNullProperty(obj) {
    if (!obj) return;
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value === null) {
            Reflect.deleteProperty(obj, key);
        }
        if (typeof value === 'object') {
            deleteNullProperty(value);
        }
    });
}

export default class Detail extends Component {
    state = {
        name: '',
        xml: '',
        jsonStr: '',
        loading: false,
    };

    /* eslint-disable */
    componentDidMount() {
        const {id} = this.props.params;
        this.jsonEditor = new JSONEditor(this.jsonEditorContainer, {mode: 'view', navigationBar: false});

        this.setState({loading: true});
        promiseAjax.get(`/pdse/${id}`)
            .then(res => {
                if (res.success) {
                    const {
                        id,
                        name,
                        xmlText,
                        jsonText,
                        createTime,
                        ispush,
                    } = res.data;
                    const xml = window.decodeURIComponent(xmlText);
                    const json = window.JSON.parse(jsonText);

                    Reflect.deleteProperty(json, 'status');

                    deleteNullProperty(json);

                    this.setState({
                        id,
                        createTime,
                        name,
                        status: ispush,
                        xml,
                        jsonStr: window.JSON.stringify(json, null, 4),
                    });
                    this.jsonEditor.set(json);
                    this.jsonEditor.expandAll();
                } else {
                    message.error('获取数据失败！');
                }
            }).finally(() => this.setState({loading: false}));
    }

    /* eslint-enable */

    componentWillUnmount() {
        this.jsonEditor.destroy();
    }

    render() {
        const {
            id,
            createTime,
            status,
            name,
            xml,
        } = this.state;

        if (status === 0) {
           this.setState({status:'新增'})
        }
        if (status === -1) {
            this.setState({status:'回收'})
        }
        if (status === 1) {
            this.setState({status:'已推送'})
        }
        return (
            <PageContent>
                <Card title="详情" style={{marginBottom: 16}}>
                    <div style={{marginBottom: 16}}><h3>ID: {id}</h3></div>
                    <div style={{marginBottom: 16}}><h3>数据源名称: {name}</h3></div>
                    <div style={{marginBottom: 16}}><h3>状态: {status}</h3></div>
                    <div style={{marginBottom: 16}}><h3>创建时间: {moment(createTime).format('YYYY-MM-DD HH:mm:ss')}</h3></div>
                </Card>
                <Card title="XML" style={{marginBottom: 16}}>
                    <pre>
                        <code>
                            {xml}
                        </code>
                    </pre>
                </Card>
                <Card title="JSON" bodyStyle={{padding: 0}}>
                    <div ref={node => this.jsonEditorContainer = node}/>
                </Card>
            </PageContent>
        );
    }
}
