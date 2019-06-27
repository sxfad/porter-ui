import React, {Component} from 'react';
import {Router, browserHistory} from 'react-router';
import allPageRoutes from '../route/all-routes';
import connectComponent from '../redux/store/connectComponent.js';
import pageRoutes from '../route/page-routes';

let Error404;
let Frame;
let Home;
let historyListen;
let cfgOnLeave;
let cfgOnEnter;
let onRouterDidMount;
let createElement;

export function initRouter(options) {
    Error404 = options.Error404;
    Frame = options.Frame;
    Home = options.Home;
    historyListen = options.historyListen;
    cfgOnLeave = options.onLeave;
    cfgOnEnter = options.onEnter;
    onRouterDidMount = options.onRouterDidMount;
    createElement = options.createElement;
}

export default class extends Component {
    constructor(props) {
        super(props);
        const allRoutes = allPageRoutes.concat(pageRoutes);
        // 所有未截获请求，渲染Error404组件
        allRoutes.push(
            {
                path: '*',
                component: connectComponent(Error404),
            }
        );

        // 没找到统一的enter 和 leave回调，这里只能为每个route都添加
        allRoutes.forEach(r => {
            const oriOnEnter = r.onEnter;
            const oriOnLeave = r.onLeave;

            r.onEnter = (nextState, replace, callback) => {
                this.onEnter(nextState, replace, callback, oriOnEnter);
            };
            r.onLeave = (prevState) => {
                this.onLeave(prevState, oriOnLeave);
            };
        });

        this.routes = {
            path: '/',
            component: connectComponent(Frame),
            indexRoute: {
                component: connectComponent(Home),
                onEnter: this.onEnter,
                onLeave: this.onLeave,
            },
            childRoutes: allRoutes,
        };

        browserHistory.listen((...args) => {
            if (historyListen) {
                historyListen(...args);
            }
        });
    }


    onLeave = (prevState, oriOnLeave) => {
        if (cfgOnLeave) cfgOnLeave(prevState);

        if (oriOnLeave) {
            oriOnLeave(prevState);
        }
    }

    onEnter = (nextState, replace, callback, oriOnEnter) => {
        if (cfgOnEnter) cfgOnEnter(nextState, replace, callback);

        if (oriOnEnter) {
            oriOnEnter(nextState, replace, callback);
        } else {
            const scrollDom = document.documentElement || document.body;
            scrollDom.scrollTop = 0;
            callback();
        }
    }

    // 这里可以注入通用props
    createElement = (RouteComponent, props) => {
        if (createElement) {
            return createElement(RouteComponent, props);
        }
        return (
            <RouteComponent {...props}/>
        );
    }

    componentDidMount() {
        if (onRouterDidMount) onRouterDidMount();
    }

    render() {
        return (
            <Router
                routes={this.routes}
                history={browserHistory}
                createElement={this.createElement}
            />
        );
    }
}
