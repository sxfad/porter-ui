import * as PubSubMsg from './pubsubmsg';
/**
 * 组件开始请求，可以用来显示loading
 */
export function startFetchingComponent() {
    PubSubMsg.publish('start-fetching-component');
}

/**
 * 组件请求完成，可以用来隐藏loading
 */
export function endFetchingComponent() {
    PubSubMsg.publish('end-fetching-component');
}

/**
 * 根据地址栏判断是否应该渲染组件，开速切换，由于组件异步，有可能出现窜页情况
 * @param {object} nextState
 * @returns {boolean}
 */
export function shouldComponentMount(nextState) {
    return window.location.pathname === nextState.location.pathname;
}
