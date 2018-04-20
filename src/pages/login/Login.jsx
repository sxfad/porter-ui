import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Form, Input, Icon, Button} from 'antd';
import {isDev} from 'sx-ui';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {init as initStorage, session} from 'sx-ui/utils/storage';
import {convertToTree} from 'sx-ui/utils/tree-utils';
import {setCurrentLoginUser, setMenuTreeData, isMock, getAjaxBaseUrl} from '../../commons';
import './style.less';
import menuTree from '../menus';

const md5 = require('../common/md5');
const FormItem = Form.Item;
function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

if (isDev) {
    require('../../mock/index');

    console.log('current mode is debug, mock is started');
}

promiseAjax.init({
    setOptions: (instance) => {
        instance.defaults.baseURL = getAjaxBaseUrl();
    },
    isMock,
});

@Form.create()
class Login extends Component {
    state = {
        loading: false,
        errorMessage: '',
    }

    componentDidMount() {
        // To disabled submit button at the beginning.
        this.props.form.validateFields();
        document.getElementById('loginBox').getElementsByTagName('form')[0].setAttribute('autocomplete', 'off');
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.loading) {
            return;
        }
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {username, password} = values;
                this.setState({loading: true, errorMessage: ''});
                promiseAjax.post('/login?LoginName=' + username + '&passwd=' + md5(password)).then(res => {
                    console.log('登录了');
                    if (res.success) {
                        promiseAjax.init({
                            setOptions: (instance) => {
                                instance.defaults.baseURL = getAjaxBaseUrl();
                                instance.defaults.headers = {
                                    'X-Token': res.data.token,
                                };
                            },
                        });
                        const currentLoginUser = {
                            authToken: res.data.token,
                            id: username,
                            name: username,
                            loginName: username,
                        };
                        initStorage({
                            keyPrefix: currentLoginUser.id,
                        });
                        session.setItem('authToken', res.data.token);
                        setCurrentLoginUser(currentLoginUser);

                        // 设置菜单
                        promiseAjax.get(`/getuserinfo`).then(rsp => {
                            if (rsp.success) {
                                const newMenus = [];
                                const menusItemGlobal = {
                                    key: '-1',
                                    text: '全部菜单',
                                    icon: 'global',
                                    path: '',
                                };
                                newMenus.push(menusItemGlobal);
                                const menusList = rsp.data.CMenu.menus;
                                for (let i = 0; i < menusList.length; i++) {
                                    const menusItem = {};
                                    menusItem.key = menusList[i].code;
                                    menusItem.parentKey = menusList[i].fathercode;
                                    menusItem.text = menusList[i].name;
                                    menusItem.icon = menusList[i].menuImage;
                                    menusItem.path = menusList[i].menuUrl;
                                    newMenus.push(menusItem);

                                    console.log(menusList.menus);
                                    for (let j = 0; j < menusList[i].menus.length; j++) {
                                        const childMenusItem = {};
                                        childMenusItem.key = menusList[i].menus[j].code;
                                        childMenusItem.parentKey = menusList[i].menus[j].fathercode;
                                        childMenusItem.text = menusList[i].menus[j].name;
                                        childMenusItem.icon = menusList[i].menus[j].menuImage;
                                        childMenusItem.path = menusList[i].menus[j].menuUrl;
                                        newMenus.push(childMenusItem);
                                    }
                                }

                                const menuTreeData = convertToTree(newMenus);
                                setMenuTreeData(menuTreeData);
                                window.location.href = '/';
                            }
                        }).finally(() => {
                        });
                    } else {
                        let errorMessage = '账号或密码错误';
                        if (res.message != 'Login error') {
                            errorMessage = res.message;
                        }
                        this.setState({loading: false, errorMessage});
                    }
                }).catch(error => {
                    this.setState({loading: false, errorMessage: error.message});
                });
            }
        });
    }

    render() {
        const {loading, errorMessage} = this.state;
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;

        // Only show error after a field is touched.
        const userNameError = isFieldTouched('username') && getFieldError('username');
        const passwordError = isFieldTouched('password') && getFieldError('password');
        // 账号/密码：abc/123
        return (
            <div className="login-content">
                <div className="login">
                    <div className="login-box" id="loginBox">
                        <h1>用户登录</h1>
                        <Form onSubmit={this.handleSubmit}>
                            <FormItem
                                validateStatus={userNameError ? 'error' : ''}
                                help={userNameError || ''}
                            >
                                {getFieldDecorator('username', {
                                    rules: [{required: true, message: '请输入用户名！'}],
                                })(
                                    <Input prefix={<Icon type="user" style={{fontSize: 13}}/>} placeholder="用户名"/>
                                )}
                            </FormItem>
                            <FormItem
                                validateStatus={passwordError ? 'error' : ''}
                                help={passwordError || ''}
                            >
                                {getFieldDecorator('password', {
                                    rules: [{required: true, message: '请输入密码！'}],
                                })(
                                    <Input prefix={<Icon type="lock" style={{fontSize: 13}}/>} type="password"
                                           placeholder="密码"/>
                                )}
                            </FormItem>
                            <FormItem
                                style={{marginBottom: 8}}
                            >
                                <Button
                                    style={{width: '100%'}}
                                    loading={loading}
                                    type="primary"
                                    htmlType="submit"
                                    disabled={hasErrors(getFieldsError())}
                                >
                                    登录
                                </Button>
                            </FormItem>
                        </Form>
                        <div className="error-message">
                            {errorMessage}
                        </div>
                        <p>随行付 © 2017</p>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Login />, document.getElementById('main'));
