import React, {Component} from 'react';
import {Menu, Popconfirm, Popover, Badge, Modal, Form} from 'antd';
import {Link} from 'react-router';
import classNames from 'classnames';
import {FontIcon, UserAvatar} from 'sx-ui/antd';
import {getFirstValue} from 'sx-ui/utils/tree-utils';
import {session} from 'sx-ui/utils/storage';
import {toLogin, getCurrentLoginUser} from '../commons';
import connectComponent from '../redux/store/connectComponent';
import ResetPasswor from '../pages/User/ResetPasswor';

const FormItem = Form.Item;
class LayoutComponent extends Component {
    state = {
        passwordVisible: false,
    }

    componentDidMount() {

    }

    handleLogoutPopVisibleChange = (visible) => {
        if (visible) {
            // 使弹框固定，不随滚动条滚动
            window.setTimeout(() => {
                const popover = document.querySelector('.ant-popover.ant-popover-placement-bottomRight');
                popover.style.top = '56px';
                popover.style.position = 'fixed';
            }, 0);
        }
    }

    handleLogout = () => {
        session.clear();
        toLogin();
    }

    renderMenus() {
        const {menuTreeData = []} = this.props;
        return menuTreeData.map(node => {
            const key = node.key;
            const path = getFirstValue(menuTreeData, node, 'path');
            const icon = node.icon;
            const text = node.text;
            return (
                <Menu.Item key={key}>
                    <Link to={path}>
                        <FontIcon type={icon}/>{text}
                    </Link>
                </Menu.Item>
            );
        });
    }

    handlePasswordOk = () => {
        this.setState({passwordVisible: false});
    }

    handlePasswordCancel = () => {
        this.setState({passwordVisible: false});
    }

    rePassword = () => {
        this.setState({passwordVisible: true});
    }

    closeModal() {
        this.setState({
            passwordVisible: false,
        });
    }

    render() {
        const {currentTopMenuNode = {}, sideBarCollapsed, showSideBar} = this.props;
        const frameHeaderClass = classNames({
            'side-bar-collapsed': sideBarCollapsed,
            'side-bar-hidden': !showSideBar,
        });
        const frameHeaderMenu = showSideBar ? 'none' : '';
        const user = getCurrentLoginUser() ||
            {
                name: '匿名',
                loginName: 'no name',
                avatar: '',
            };
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 5},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15},
            },
        };
        return (
            <div className={`frame-header ${frameHeaderClass}`}>
                <div className={`left-menu ${frameHeaderClass}`} style={{display: frameHeaderMenu}}>
                    <Menu
                        selectedKeys={[currentTopMenuNode.key]}
                        mode="horizontal"
                    >
                        {this.renderMenus()}
                    </Menu>
                </div>
                <div className="right-menu">
                    <div className="right-menu-item" onClick={() => this.rePassword()}>
                        <UserAvatar user={user}/>
                        <span>{user.name}</span>
                    </div>
                    <Popconfirm
                        onVisibleChange={this.handleLogoutPopVisibleChange}
                        placement="bottomRight"
                        title="您确定要退出系统吗？"
                        onConfirm={this.handleLogout}
                    >
                        <div className="right-menu-item">
                            <FontIcon type="logout" size="lg"/>
                        </div>
                    </Popconfirm>

                    {
                        this.state.passwordVisible ? <Modal
                            title="修改密码"
                            visible={this.state.passwordVisible}
                            onOk={this.handlePasswordOk}
                            onCancel={this.handlePasswordCancel}
                            width='50%'
                            footer={[]}
                        >
                            <ResetPasswor closeModal={this.closeModal.bind(this)}/>
                        </Modal> : null
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}

export default connectComponent({LayoutComponent, mapStateToProps});
