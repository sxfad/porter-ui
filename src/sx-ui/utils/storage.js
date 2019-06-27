/**
 * localStorage 和 sessionStorage 封装
 * @example
 * // 引入
 * import * as storage from 'path/to/storage';
 *
 * @example
 * // 初始化，如果不需要keyPrefix，可以不初始化
 * storage.init({
 *     keyPrefix: user.id,
 * });
 *
 * @example
 * // 使用localStorage相关方法
 * storage.setItem('user', userObj);
 *
 * @example
 * // 使用sessionStorage相关方法
 * import {session} from 'path/to/storage';
 * session.setItem('user', userObj);
 *
 * @module 本地存储
 */

const Storage = window.localStorage;
const sessionStorage = window.sessionStorage;
let _keyPrefix = 'default-prefix';

/**
 * 初始化配置
 * @param options keyPrefix：存储前缀，用来区分不同用户数据，否则同一台电脑，不同人存储数据会互相干扰。
 */
export function init(options) {
    const {keyPrefix = 'default-prefix'} = options;
    _keyPrefix = keyPrefix;
}

/**
 * localStorage 存储数据
 * @param {string} key
 * @param {json} value
 */
export function setItem(key, value) {
    key = _keyPrefix + key;
    value = JSON.stringify(value);
    Storage.setItem(key, value);
}

/**
 * localStorage 获取数据
 * @param {string} key
 * @return {json} key 对应的数据
 */
export function getItem(key) {
    key = _keyPrefix + key;
    let value = Storage.getItem(key);
    return JSON.parse(value);
}

/**
 * localStorage清空
 * @todo 这个清空容易清除其他用户的数据，修改一下，根据_keyPrefix清除
 */
export function clear() {
    Storage.clear();
}

/**
 * localStorage 删除数据
 * @param key
 */
export function removeItem(key) {
    key = _keyPrefix + key;
    Storage.removeItem(key);
}

/**
 * localStorage 根据keys 获取一组数据
 * @param {array} keys
 * @returns {{json}}
 */
export function multiGet(keys) {
    let values = {};
    keys.forEach(key => values[key] = getItem(key));
    return values;
}
/**
 * localStorage 根据keys 删除一组数据
 * @param {array} keys
 */
export function multiRemove(keys) {
    keys.forEach(key => removeItem(key));
}

/**
 * sessitonStorage 封装，具有localStorage同样方法
 */
export const session = {
    setItem(key, value) {
        key = _keyPrefix + key;
        value = JSON.stringify(value);
        sessionStorage.setItem(key, value);
    },
    getItem(key) {
        key = _keyPrefix + key;
        let value = sessionStorage.getItem(key);
        return JSON.parse(value);
    },
    // todo 这个清空容易清除其他用户的数据，修改一下，根据_keyPrefix清除
    clear() {
        sessionStorage.clear();
    },
    removeItem(key) {
        key = _keyPrefix + key;
        sessionStorage.removeItem(key);
    },
    multiGet(keys) {
        let values = {};
        keys.forEach(key => values[key] = this.getItem(key));
        return values;
    },
    multiRemove(keys) {
        keys.forEach(key => this.removeItem(key));
    },
};

/**
 * 全局存储封装，刷新之后将被清空
 */
const globalStorage = {};
export const global = {
    setItem(key, value) {
        key = _keyPrefix + key;
        globalStorage[key] = value;
    },
    getItem(key) {
        key = _keyPrefix + key;
        return globalStorage[key];
    },
    clear() {
        Object.keys(globalStorage).forEach(key => {
            if (key.startsWith(_keyPrefix)) {
                delete globalStorage[key];
            }
        });
    },
    removeItem(key) {
        key = _keyPrefix + key;
        delete globalStorage[key];
    },
    multiGet(keys) {
        let values = {};
        keys.forEach(key => values[key] = this.getItem(key));
        return values;
    },
    multiRemove(keys) {
        keys.forEach(key => this.removeItem(key));
    },
};
