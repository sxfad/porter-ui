/**
 * 发布订阅模式,带有消息队列 生产者消费者 性质
 * @module 发布订阅
 * */

const topics = {};
const unConsumedMsg = {}; // key 对应主题，value对应消息数据
/**
 * 发布一个消息
 * @param {String} topic 消息名称
 * @param {*} [args] 消息数据
 */
export function publish(topic, args) {
    /*
     * 消息统一放入消息队列当中。
     * 注意：为了后订阅的所有订阅者都能接受到消息，这个消息队列不会被清空，如果存在大量的后订阅情况，小心内存溢出。
     * */
    unConsumedMsg[topic] = args;

    if (!topics[topic]) {
        return false;
    }

    for (let p of Object.keys(topics[topic])) {
        let func = topics[topic][p].func;
        let once = topics[topic][p].once;

        if (func) {
            func(args);
            if (once) {
                delete (topics[topic][p]);
            }
        }
    }
}

/**
 * 通过事件名称、订阅者名称、回调函数订阅事件、同一个事件，不同的订阅者可以通过name单独取消自己的订阅
 * @param {String} topic 事件名
 * @param {String} name 订阅者名 可选 如果没指定那么，那么不能单独取消订阅，只能统一取消订阅。
 * @param {function} func 订阅事件（发布时触发）
 * @param {boolean} once 是否只触发一次func
 * @param {boolean} acceptOldMsg 是否接受历史消息
 * @private
 */
function _subscribe(topic, name, func, once, acceptOldMsg) {
    if (!topics[topic]) {
        topics[topic] = {};
    }

    topics[topic][name] = {};
    topics[topic][name].func = func;
    topics[topic][name].once = once;

    if (acceptOldMsg) {
        // 对应topic下加入回调函数
        /*
         * 查询是否有未消费的相应消息，如果有，立即执行回调。
         * */
        if (topic in unConsumedMsg) {
            let data = unConsumedMsg[topic];
            func(data);
        }
    }
}

/**
 * 订阅
 * @param {String} topic 事件名
 * @param {String} name 订阅者名 可选 如果没指定那么，那么不能单独取消订阅，只能统一取消订阅。
 * @param {function} func 订阅事件（发布时触发）
 */
export function subscribe(topic, name, func) {
    if (arguments.length === 2) {
        func = name;
        name = new Date().getTime(); // 未指定name，使用时间戳，指定一个
    }
    _subscribe(topic, name, func, false, false);
}

/**
 * 订阅并消费历史消息
 * @param {String} topic 事件名
 * @param {String} name 订阅者名 可选 如果没指定那么，那么不能单独取消订阅，只能统一取消订阅。
 * @param {function} func 订阅事件（发布时触发）
 */
export function subscribeAcceptOldMsg(topic, name, func) {
    if (arguments.length === 2) {
        func = name;
        name = new Date().getTime();// 未指定name，使用时间戳，指定一个
    }

    this._subscribe(topic, name, func, false, true);
}

/**
 * 订阅一次
 * @param {String} topic 事件名
 * @param {String} name 订阅者名 可选 如果没指定那么，那么不能单独取消订阅，只能统一取消订阅。
 * @param {function} func 订阅事件（发布时触发）
 */
export function subscribeOnce(topic, name, func) {
    if (arguments.length === 2) {
        func = name;
        name = new Date().getTime(); // 未指定name，使用时间戳，指定一个
    }

    this._subscribe(topic, name, func, true, false);
}

/**
 * 订阅一次，并消费历史消息
 * @param {String} topic 事件名
 * @param {String} name 订阅者名 可选 如果没指定那么，那么不能单独取消订阅，只能统一取消订阅。
 * @param {function} func 订阅事件（发布时触发）
 */
export function subscribeOnceAcceptOldMsg(topic, name, func) {
    if (arguments.length === 2) {
        func = name;
        name = new Date().getTime(); // 未指定name，使用时间戳，指定一个
    }

    this._subscribe(topic, name, func, true, true);
}

/**
 *
 * @param {String} topic 事件名
 * @param {String} name 订阅者名 可选 如果没指定那么，那么不能单独取消订阅，只能统一取消订阅。
 */
export function unsubscribe(topic, name) {
    if (!topics[topic]) {
        return false;
    }

    if (!name) {
        // 解绑所有 topic 事件
        delete topics[topic];
    } else if (topics[topic][name]) {
        // 解绑 topic 事件下的指定 name 订阅者
        delete topics[topic][name];
    }
}
