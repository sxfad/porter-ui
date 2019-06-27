/**
 * 通用的一些工具方法
 * @module 通用工具方法
 * */


/**
 * 获取字符串字节长度，中文占两个字节
 * @param value
 * @returns {number}
 */
export function getStringByteLength(value) {
    if (!value) return 0;
    let length = value.length;

    for (let i = 0; i < value.length; i++) {
        if (value.charCodeAt(i) > 127) {
            length++;
        }
    }

    return length;
}

/**
 * 格式化字符串
 * @example
 * stringFormat('H{0}llo W{1}rld!', 'e', 'o');
 * stringFormat('H{eKey}llo W{oKey}rld!', {eKey: 'e', oKey: 'o'});
 * @param {String} value 需要格式化的字符串
 * @param {*} args 对象或者多个参数
 * @returns {*}
 */
export function stringFormat(value, ...args) {
    if (!value) return value;
    if (typeof value !== 'string') return value;
    if (!args || !args.length) return value;

    if (args.length === 1 && typeof (args[0]) === 'object') {
        const arg = args[0];
        Object.keys(arg).forEach(key => {
            if (arg[key] !== undefined) {
                const reg = new RegExp(`({${key}})`, 'g');
                value = value.replace(reg, arg[key]);
            }
        });
        return value;
    }

    for (let i = 0; i < args.length; i++) {
        if (args[i] !== undefined) {
            let reg = new RegExp(`({)${i}(})`, 'g');
            value = value.replace(reg, args[i]);
        }
    }
    return value;
}

/**
 * 获取cookie
 * @param {String} objName 存储coolie中数据的key
 * @returns {String}
 */
export function getCookie(objName) {
    let arrStr = document.cookie.split('; ');
    for (let i = 0; i < arrStr.length; i++) {
        let temp = arrStr[i].split('=');
        if (temp[0] === objName) return unescape(temp[1]);
    }
    return '';
}

/**
 * 获取浏览器
 * @returns {number}
 */
export function getScrollBarWidth() {
    let scrollDiv = document.createElement('div');
    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top = '-9999px';
    scrollDiv.style.width = '50px';
    scrollDiv.style.height = '50px';
    scrollDiv.style.overflow = 'scroll';
    document.body.appendChild(scrollDiv);
    let scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    window.document.body.removeChild(scrollDiv);
    return scrollBarWidth;
}

/**
 * 获得一个指定范围内的随机数
 * @param {number} min 最范围
 * @param {number} max 最大范围
 * @returns {number}
 */
export function getRandomNum(min, max) {
    const range = max - min;
    const rand = Math.random();
    return (min + Math.round(rand * range));
}

/**
 * 为一个dom元素移除class
 * @param {string} selector document.querySelectory 要到的选择器
 * @param {string} className 要移除的class
 */
export function removeClass(selector, className) {
    let dom = selector;
    if (typeof selector === 'string') {
        dom = document.querySelector(selector);
    }
    if (!dom) return;
    let domClass = dom.className;
    if (domClass) {
        domClass = domClass.split(' ');
        if (!domClass || !domClass.length) return;
        dom.className = domClass.filter(c => c !== className).join(' ');
    }
}

/**
 * 为一个dom元素添加class
 * @param {string} selector document.querySelectory 要到的选择器
 * @param {string} className 要添加的class
 */
export function addClass(selector, className) {
    let dom = selector;
    if (typeof selector === 'string') {
        dom = document.querySelector(selector);
    }
    if (!dom) return;
    let domClass = dom.className;
    if (domClass) {
        domClass = domClass.split(' ');
        if (!domClass || !domClass.length || domClass.indexOf(className) > -1) return;
        domClass.push(className);
        dom.className = domClass.join(' ');
    } else {
        dom.className = className;
    }
}

/**
 * 拼接get请求所需url
 * @param {string} url
 * @param {object} params 请求参数
 * @returns {string} 拼接后的url
 */
export function mosaicUrl(url, params) {
    if (!params) return url;
    const queryString = [];
    Object.keys(params).forEach(key => {
        let value = params[key];
        if (value !== undefined && value !== null) {
            queryString.push(`${key}=${value}`);
        }
    });
    const qStr = queryString.join('&');
    if (url.indexOf('?') < 0) {
        url += `?${qStr}`;
    } else if (url.endsWith('&')) {
        url += qStr;
    } else if (url.endsWith('?')) {
        url += `${qStr}`;
    } else {
        url += `&${qStr}`;
    }
    return url;
}

/**
 * 根据keyPath查找一个object中的数据
 * @param obj 需要查找的对象
 * @param {string} keyPath 类似： a.b.c
 * @returns {*} 查找到的数据
 */
function findObjByKeyPath(obj, keyPath) {
    const keys = keyPath.split('.');
    let targetObj = obj;
    keys.forEach(k => {
        targetObj = targetObj[k];
    });
    return targetObj;
}

/**
 * 从数组中删除一个元素，此方法具有副作用，修改了原数组
 * @param {Array} arr 需要操作的数组
 * @param {*} item 要删除的元素，注意：内部是用'==='比对的
 */
export function arrayRemove(arr, item) {
    let itemIndex = -1;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === item) {
            itemIndex = i;
            break;
        }
    }
    if (itemIndex > -1) {
        arr.splice(itemIndex, 1);
    }
}

/**
 * 从数组中删除一些元素，此方法具有副作用，修改了原数组
 * @param {Array} arr 需要操作的数组
 * @param {Array} items 需要删除的元素
 */
export function arrayRemoveAll(arr, items) {
    items.forEach(item => {
        arrayRemove(arr, item);
    });
}

/**
 * 根据指定keyPath 添加元素，此方法具有副作用，修改了传入的obj
 * @param obj 要操作的数据
 * @param {string} keyPath 类似于：a.b.c，就会把value赋值给c
 * @param {*} value 要设置的数据
 * @throws Will throw error if keyPath dose not point to an object
 */
export function objSetValue(obj, keyPath, value) {
    const pointLastIndex = keyPath.lastIndexOf('.');
    if (pointLastIndex < 0) {
        if (typeof obj !== 'object') {
            throw new Error('keyPath dose not point to an boject!');
        }
        obj[keyPath] = value;
        return;
    }
    const key = keyPath.substr(pointLastIndex + 1, keyPath.length);
    keyPath = keyPath.substr(0, pointLastIndex);
    let targetObj = findObjByKeyPath(obj, keyPath);
    if (typeof targetObj !== 'object') {
        throw new Error('keyPath dose not point to an boject!');
    }
    targetObj[key] = value;
}

/**
 * 根据keyPath定位到指定元素，并将其删除，此方法具有副作用，修改了传入的obj
 * @param obj 要操作的数据
 * @param {string} keyPath keyPath 类似于：a.b.c，会把c删除
 * @throws Will throw error if keyPath dose not point to an object
 */
export function objRemove(obj, keyPath) {
    const pointLastIndex = keyPath.lastIndexOf('.');
    if (pointLastIndex < 0) {
        if (typeof obj !== 'object') {
            throw new Error('keyPath dose not point to an object!');
        }
        delete obj[keyPath];
        return;
    }
    const key = keyPath.substr(pointLastIndex + 1, keyPath.length);
    keyPath = keyPath.substr(0, pointLastIndex);
    let targetObj = findObjByKeyPath(obj, keyPath);
    if (typeof targetObj !== 'object') {
        throw new Error('keyPath dose not point to an object!');
    }
    delete targetObj[key];
}

/**
 * 根据keyPath定位到指定数组，并添加元素，此方法具有副作用，修改了传入的obj
 * @param obj 要操作的数据
 * @param keyPath 类似于：a.b.c，通过keyPath，定位到obj中某个数组
 * @param value 需要append的元素
 * @throws Will throw error if keyPath dose not point to an array
 */
export function arrAppendValue(obj, keyPath, value) {
    let targetObj = findObjByKeyPath(obj, keyPath);
    if (!Array.isArray(targetObj)) {
        throw new Error('keyPath dose not point to an array!');
    }
    if (Array.isArray(value) && value.length) {
        value.forEach(v => targetObj.push(v));
    } else {
        targetObj.push(value);
    }
}

/**
 * 根据keyPath定位到指定数组，删除一个元素，此方法具有副作用，修改了传入的obj
 * @param obj 要操作的数据
 * @param keyPath 类似于：a.b.c，通过keyPath，定位到obj中某个数组
 * @param value 需要删除的数组元素
 * @throws Will throw error if keyPath dose not point to an array
 */
export function arrRemove(obj, keyPath, value) {
    let targetObj = findObjByKeyPath(obj, keyPath);
    if (!Array.isArray(targetObj)) {
        throw new Error('keyPath dose not point to an array!');
    }
    arrayRemove(targetObj, value);
}

/**
 * 根据keyPath定位到指定数组，删除所有跟value相同的元素，此方法具有副作用，修改了传入的obj
 * @param obj 要操作的数据
 * @param keyPath 类似于：a.b.c，通过keyPath，定位到obj中某个数组
 * @param value 移除的数组元素
 * @throws Will throw error if keyPath dose not point to an array
 */
export function arrRemoveAll(obj, keyPath, value) {
    let targetObj = findObjByKeyPath(obj, keyPath);
    if (!Array.isArray(targetObj)) {
        throw new Error('keyPath dose not point to an array!');
    }
    while (targetObj.indexOf(value) > -1) {
        arrayRemove(targetObj, value);
    }
}

/**
 * 数组去重，此方法不改变原有数据，返回新的数组
 * @param {Array} array
 * @returns {Array} 新数组
 */
export function uniqueArray(array) {
    const n = {}; // hash 表
    const r = []; // 临时数组
    for (let i = 0; i < array.length; i++) { // 遍历当前数组
        if (!n[array[i]]) { // 如果hash表中没有当前项
            n[array[i]] = true; // 存入hash表
            r.push(array[i]); // 把当前数组的当前项push到临时数组里面
        }
    }
    return r;
}
