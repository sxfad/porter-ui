import React, {Component} from 'react';
import uuidV4 from 'uuid/v4';
import {PubSubMsg} from '../index';

/**
 * 发布订阅高级组件
 * 将$on $emit 属性注入到目标组件props中，目标组件可以通过this.props.$on(topic, callback)方式进行使用;
 * 每次$on 注册事件是，保存了事件名称，在componentWillUnmount方法中，进行统一事件清除
 * @example
 * import event from 'path/to/event-decorator';
 * // 装饰器方式：
 * // @event()
 * // class SomeComponent extends Component {...}
 *
 * // 传递参数，修改注入的props属性
 * // @event({onPropName = '$$on'}) // 组件内调用：this.props.$$on
 * // class SomeComponent extends Component {...}
 *
 * @example
 * // 直接使用
 * import event from 'path/to/event-decorator';
 * const WrappedComponet = event()(SomeComponent);
 *
 * @module 发布订阅高级组件
 */

export default function event({onPropName = '$on', emitPropName = '$emit'} = {}) {
    return function (WrappedComponent) {
        class WithSubscription extends Component {
            constructor(props) {
                super(props);
                this._channel = uuidV4();
                this._subscribedTopices = []; // 通过_channel保存已经订阅的事件，组件卸载时，统一取消订阅
                this[onPropName] = (topic, fn) => { // $on方法
                    this._subscribedTopices.push(topic);
                    PubSubMsg.subscribe(topic, this._channel, fn);
                };
                this[emitPropName] = (topic, args) => { // $emit方法
                    PubSubMsg.publish(topic, args);
                };
            }

            static displayName = `WithSubscription(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

            componentWillUnmount() {
                // 当前组件卸载，取消订阅当前组件已经订阅的事件
                this._subscribedTopices.forEach(item => {
                    PubSubMsg.unsubscribe(item, this._channel);
                });
            }

            render() {
                const injectProps = {
                    [onPropName]: this[onPropName],
                    [emitPropName]: this[emitPropName],
                };
                return <WrappedComponent {...injectProps} {...this.props}/>;
            }
        }

        return WithSubscription;
    };
}
