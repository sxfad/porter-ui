import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Form, Input, Icon, Button, notification, message} from 'antd';
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
        status: false,
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
        this.props.form.validateFields([
            'username',
            'password',
        ], (err, values) => {
            if (!err) {
                const {username, password} = values;
                this.setState({loading: true, errorMessage: ''});
                promiseAjax.post('/login?loginName=' + username + '&passwd=' + md5(password)).then(res => {
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
                                currentLoginUser.nickName = rsp.data.nickName;
                                setCurrentLoginUser(currentLoginUser);

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

    // 注册提交
    handleRegisterSubmit = () => {
        // '',
        this.props.form.validateFields([
            'loginname',
            'loginpw',
            'nickname',
            'email',
            'mobile',
            'departMent'
        ], (err, values) => {
            if(!err){
                const {confirmloginpw, loginpw} = this.props.form.getFieldsValue();
                const loginpwMd5 = md5(loginpw);
                if (loginpw !== confirmloginpw) {
                    notification.error({
                        message: '注册失败',
                        description: '两次密码输入不一致',
                        duration: 1.5
                    });
                } else {
                    let params = {
                        loginName : values.loginname,
                    };
                    promiseAjax.get(`/checkLoginName`, params, {errorTip: false})
                        .then(response => {
                            if (response.data <= 0) {
                                values.loginpw = loginpwMd5;
                                promiseAjax.post(`/register`, values, {errorTip: false})
                                    .then(res => {
                                        if(res.code === 200) {
                                            notification.success({
                                                message: '注册成功',
                                                description: '请登陆',
                                                duration: 1.5
                                            });
                                            this.setState({
                                                status: false
                                            })
                                        }
                                    });
                            }else{
                                message.error('用户名已注册', 1.5);
                            }
                        })
                }
            } else {
                notification.error({
                    message: '注册失败',
                    description: '请监察数据填写',
                    duration: 1.5
                });
            }
        })
    };

    // 鼠标移出时校验用户名
    handleBlur = () => {
        this.props.form.validateFields([
            'loginname',
        ], (err, values) => {
            if (!err) {
                let params = {
                    loginName : values.loginname,
                };
                promiseAjax.get(`/checkLoginName`, params, {errorTip: false})
                .then(res=>{
                    if(res.data > 0) {
                        message.error('用户名已注册', 1.5);
                    }
                });
            }
        })
    }

    // 返回
    handleBack = () => {
        this.setState({
            status: false
        })
    }

    // 重置
    handleReset = () => {
        this.props.form.resetFields();
    }

    // 登陆时的注册
    handleRegister = () => {
        this.setState({
            status: true
        });
    }

    render() {
        const {loading, errorMessage} = this.state;
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;

        // Only show error after a field is touched.
        const userNameError = isFieldTouched('username') && getFieldError('username');
        const passwordError = isFieldTouched('password') && getFieldError('password');
        const loginpwConfirmError = isFieldTouched('confirmloginpw') && getFieldError('confirmloginpw');
        const emailError = isFieldTouched('email') && getFieldError('email');
        const loginnameError = isFieldTouched('loginname') && getFieldError('loginname');
        const loginpwError = isFieldTouched('loginpw') && getFieldError('loginpw');
        const nicknameError = isFieldTouched('nickname') && getFieldError('nickname');
        const mobileError = isFieldTouched('mobile') && getFieldError('mobile');
        const departMentError = isFieldTouched('departMent') && getFieldError('departMent');
        // 账号/密码：abc/123
        return (
            <div className="login-content">
                {this.state.status === true ?
                    <div className="login">
                        <div className="login-box"  style={{width: '30%'}}>
                            <h1>用户注册</h1>
                            <Form onSubmit={this.handleSubmit}>
                                <FormItem
                                    validateStatus={loginnameError ? 'error' : ''}
                                    help={loginnameError || ''}
                                >
                                    {getFieldDecorator('loginname', {
                                        rules: [{required: true, message: '请输入登陆名！'}],
                                    })(
                                        <Input onBlur={this.handleBlur} prefix={<Icon type="user" style={{fontSize: 13}}/>} placeholder="登录名"/>
                                    )}
                                </FormItem>
                                <FormItem
                                    validateStatus={loginpwError ? 'error' : ''}
                                    help={loginpwError || ''}
                                >
                                    {getFieldDecorator('loginpw', {
                                        rules: [{required: true, message: '请输入密码！'}],
                                    })(
                                        <Input prefix={<Icon type="lock" style={{fontSize: 13}}/>} type="password"
                                               placeholder="登录密码"/>
                                    )}
                                </FormItem>
                                <FormItem
                                    validateStatus={loginpwConfirmError ? 'error' : ''}
                                    help={loginpwConfirmError || ''}
                                >
                                    {getFieldDecorator('confirmloginpw', {
                                        rules: [{required: true, message: '请再次输入密码！'}],
                                    })(
                                        <Input prefix={<Icon type="unlock" style={{fontSize: 13}}/>} type="password"
                                               placeholder="确认密码"/>
                                    )}
                                </FormItem>
                                <FormItem
                                    validateStatus={nicknameError ? 'error' : ''}
                                    help={nicknameError || ''}
                                >
                                    {getFieldDecorator('nickname', {
                                        rules: [{required: true, message: '请输入昵称！'}],
                                    })(
                                        <Input prefix={<Icon type="team" style={{fontSize: 13}}/>} placeholder="昵称"/>
                                    )}
                                </FormItem>
                                <FormItem
                                    validateStatus={emailError ? 'error' : ''}
                                    help={emailError || ''}
                                >
                                    {getFieldDecorator('email', {
                                        rules: [
                                            {required: true, message: '请输入邮箱！'},
                                            {type: 'email', message: '请输入正确的邮箱地址'},
                                        ],
                                    })(
                                        <Input prefix={<Icon type="mail" style={{fontSize: 13}}/>} placeholder="邮箱"/>
                                    )}
                                </FormItem>
                                <FormItem
                                    validateStatus={mobileError ? 'error' : ''}
                                    help={mobileError || ''}
                                >
                                    {getFieldDecorator('mobile', {
                                        rules: [
                                            {required: true, message: '请输入手机号！'},
                                        ],
                                    })(
                                        <Input prefix={<Icon type="phone" style={{fontSize: 13}}/>} placeholder="手机号"/>
                                    )}
                                </FormItem>
                                <FormItem
                                    validateStatus={departMentError ? 'error' : ''}
                                    help={departMentError || ''}
                                >
                                    {getFieldDecorator('departMent', {
                                        rules: [{required: true, message: '请输入部门！'}],
                                    })(
                                        <Input prefix={<Icon type="usergroup-add" style={{fontSize: 13}}/>} placeholder="部门"/>
                                    )}
                                </FormItem>
                                <div style={{float: 'right'}}>
                                    <Button style={{marginRight: 8}} type = 'primary' onClick={this.handleRegisterSubmit}>提交</Button>
                                    <Button style={{marginRight: 8}} onClick={this.handleReset}>重置</Button>
                                    <Button type = 'primary' onClick={this.handleBack}>返回</Button>
                                </div>
                            </Form>
                        </div>
                    </div> :
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
                                <FormItem
                                    style={{marginBottom: 8}}
                                >
                                    <Button
                                        style={{width: '100%'}}
                                        type='primary'
                                        onClick={this.handleRegister}
                                    >
                                        注册
                                    </Button>
                                </FormItem>
                            </Form>
                            <div className="error-message">
                                {errorMessage}
                            </div>
                            <p>随行付 © 2017</p>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

ReactDOM.render(<Login />, document.getElementById('main'));
