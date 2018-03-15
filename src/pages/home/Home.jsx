import React, {Component} from 'react';
import {PageContent} from 'sx-ui/antd';
import './style.less';

export const PAGE_ROUTE = '/';
export class LayoutComponent extends Component {
    state = {}

    componentWillReceiveProps(/* nextProps */) {
    }

    componentWillMount() {
        const {actions} = this.props;
        // actions.hidePageHeader();
        // actions.hideSideBar();
        actions.setPageTitle('Home');
        actions.setPageBreadcrumbs([
            {
                key: 'home',
                path: '',
                text: '首页',
                icon: 'home',
            },
        ]);
    }

    render() {
        return (
            <PageContent className="home">
                <h1>随行付分布式数据同步中间件管理系统</h1>
            </PageContent>
        );
    }
}

export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}
