import * as _utils from './utils';
import * as _promiseAjax from './utils/promise-ajax';
import * as _PubSubMsg from './utils/pubsubmsg';
import * as _storage from './utils/storage';
import * as _treeUtils from './utils/tree-utils';

export const utils = _utils;
export ajax from './utils/promise-ajax-decorator';
export const promiseAjax = _promiseAjax;
export const PubSubMsg = _PubSubMsg;
export event from './utils/event-decorator';
export const storage = _storage;
export const treeUtils = _treeUtils;

export Router, {initRouter} from './route/Router';

export {initActions} from './redux/actions';
export {initReducers} from './redux/reducers';
export configureStore from './redux/store/configure-store';
export handleAsyncReducer from './redux/store/handle-async-reducer';

export const isDev = process.env.NODE_ENV === 'development';
export const isPro = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
export const isRC = process.env.NODE_ENV === 'rc';
