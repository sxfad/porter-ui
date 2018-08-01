/**
 * 时间
 */
/**
 * 得到某时间i小时前的时间
 */
export function getBeforeHoursTime(endTime, i) {
    const newTime = new Date(endTime);
    var hours = newTime.getHours();
    var newEndTime = newTime.setHours(hours - i);
    return newEndTime;
}
/**
 * 得到某时间i分钟前的时间
 */
export function getBeforeMinutesTime(endTime, i) {
    const newTime = new Date(endTime);
    var min = newTime.getMinutes();
    var newEndTime = newTime.setMinutes(min - i);
    return newEndTime;
}

/**
 * 得到某时间i秒钟前的时间
 */
export function getBeforeSecondsTime(endTime, i) {
    const newTime = new Date(endTime);
    var seconds = newTime.getSeconds();
    var newEndTime = newTime.setSeconds(seconds - i);
    return newEndTime;
}

/**
 * 得到 YYYY-MM-DD HH:mm:ss 格式的字符串
 * @param time
 * @returns {string}
 */
export function formatDefaultTime(time) {
    var d = (new Date(time));
    var timeStr = fillDateStr(d.getFullYear()).toString() +'-' + fillDateStr(d.getMonth() + 1).toString() +'-' + fillDateStr(d.getDate().toString())  +' ' + fillDateStr(d.getHours()).toString() +':' + fillDateStr(d.getMinutes()).toString() +':' + fillDateStr(d.getSeconds()).toString();
    return timeStr;
}

/**
 * 得到 YYYYMMDDHHmmss 格式的字符串
 * @param time
 * @returns {string}
 */
export function formatTime(time) {
    var d = (new Date(time));
    var timeStr = fillDateStr(d.getFullYear()).toString() + fillDateStr(d.getMonth() + 1).toString() + fillDateStr(d.getDate().toString()) + fillDateStr(d.getHours()).toString() + fillDateStr(d.getMinutes()).toString() + fillDateStr(d.getSeconds()).toString();
    return timeStr;
}

/**
 * 得到 YYYYMMDDHHmm 格式的字符串
 * @param time
 * @returns {string}
 */
export function formatMinuteTime(time) {
    var d = (new Date(time));
    var timeStr = fillDateStr(d.getFullYear()).toString() + fillDateStr(d.getMonth() + 1).toString() + fillDateStr(d.getDate().toString()) + fillDateStr(d.getHours()).toString() + fillDateStr(d.getMinutes()).toString();
    return timeStr;
}

/**
 * 得到 HH:mm:ss 格式的字符串
 * @param time
 * @returns {string}
 */
export function formatdetailTime(time) {
    var d = (new Date(time));
    var timeStr = fillDateStr(d.getHours()).toString() + ':' + fillDateStr(d.getMinutes()).toString() + ':' + fillDateStr(d.getSeconds()).toString();
    return timeStr;
}

/**
 * 得到 HH:mm 格式的字符串
 * @param time
 * @returns {string}
 */
export function formatdetailTime1(time) {
    var d = (new Date(time));
    var timeStr = fillDateStr(d.getHours()).toString() + ':' + fillDateStr(d.getMinutes()).toString();
    return timeStr;
}

function fillDateStr(n) {
    return n < 10 ? '0' + n : n
}