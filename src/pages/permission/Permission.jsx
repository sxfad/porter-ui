import React, {Component} from 'react';
import {PageContent} from 'sx-ui/antd';
import {Select, Tree, Button} from 'antd';
import {promiseAjax} from 'sx-ui';

const {Option} = Select;
const {TreeNode} = Tree;

export const PAGE_ROUTE = '/permission';

export default class Permission extends Component {
    state = {
        roles: [],
        roleCode: void 0,
        loading: false,
        menus: [],
        checkedKeys: [],
        roleMenus: [],
    };

    componentDidMount() {
        promiseAjax.get('/crole/getAll')
            .then(res => {
                let roles = [];
                if (res && res.data && res.data.length) {
                    roles = res.data;
                }
                this.setState({roles});
            });

        this.getMenus();
        this.getRoleMenus();
    }

    getRoleMenus = () => {
        promiseAjax.get('/cRoleMenu/getRoleMenu')
            .then(res => {
                let roleMenus = [];
                if (res && res.data && res.data.length) {
                    roleMenus = res.data;
                }
                this.setState({roleMenus});
            });
    };

    getMenus = () => {
        this.setState({loading: true});
        promiseAjax.get('/cmenu/getAll')
            .then(res => {
                let menus = [];
                if (res && res.data && res.data.length) {
                    menus = res.data;
                }
                menus.forEach(item => {
                    item.isTop = item.level === 1;
                    if (item.menus && item.menus.length) {
                        item.children = item.menus;
                    }
                });
                this.setState({menus});
            })
            .finally(() => {
                this.setState({loading: false});
            });
    };

    onCheck = (info) => {
        console.log(info);
        const {checked: checkedKeys} = info;
        const {roleMenus, roleCode} = this.state;
        const rm = roleMenus.filter(item => item.roleCode !== roleCode);
        checkedKeys.forEach(item => {
            rm.push({roleCode, menuCode: item});
        });
        this.setState({checkedKeys, roleMenus: rm});
    };

    renderTreeNodes = data => data.map((item) => {
        if (item.children) {
            return (
                <TreeNode title={item.name} key={item.code} dataRef={item}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return <TreeNode title={item.name} key={item.code} dataRef={item}/>;
    });

    handleChange = (roleCode) => {
        this.setState({roleCode});
        const {roleMenus} = this.state;
        const checkedKeys = roleMenus
            .filter(item => item.roleCode === roleCode)
            .map(item => item.menuCode);
        this.setState({checkedKeys});
    };

    handleSave = () => {
        const {roleMenus, roles} = this.state;
        const cRoleMenuVoList = roles.map(item => {
            return {
                cRoleMenuList: roleMenus.filter(it => it.roleCode === item.roleCode),
                roleCode: item.roleCode,
            }
        });

        promiseAjax.post('/cRoleMenu/insert', cRoleMenuVoList, {successTip: '保存成功'})
            .then(res => {
                console.log(res);
                promiseAjax.get('/cmenu/ref', null);
            });
    };

    render() {
        const {roles, menus, roleCode, checkedKeys} = this.state;

        return (
            <PageContent>
                <Select
                    style={{width: 200}}
                    onChange={this.handleChange}
                    value={roleCode}
                    placeholder="请选择角色"
                >
                    {roles.map(item => (<Option key={item.roleCode} value={item.roleCode}>{item.roleName}</Option>))}
                </Select>
                <Tree
                    checkable
                    onCheck={this.onCheck}
                    checkedKeys={checkedKeys}
                    checkStrictly
                >
                    {this.renderTreeNodes(menus)}
                </Tree>
                <Button onClick={this.handleSave} type="primary">保存</Button>
            </PageContent>
        );
    }
}
