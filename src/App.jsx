import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {message} from 'antd';
import {isDev, promiseAjax} from 'sx-ui';
import {init as initStorage, session} from 'sx-ui/utils/storage';
import './global.less';
import {configureStore} from './redux';
import Router from './route/Router';
import handleErrorMessage from './commons/handle-error-message';
import {getCurrentLoginUser, getAjaxBaseUrl, isMock} from './commons';

if(process.env.NODE_ENV === 'development') {

}
if (isDev) {
    require('./mock/index');

    console.log('current mode is debug, mock is started');
}
const currentLoginUser = getCurrentLoginUser();

initStorage({ // 设置存储前缀，用于区分不同用户的数据
    keyPrefix: currentLoginUser && currentLoginUser.id,
});

promiseAjax.init({
    setOptions: (instance) => {
        instance.defaults.baseURL = getAjaxBaseUrl();
        instance.defaults.headers = {
            'X-Token': session.getItem('authToken'),
        };
    },
    onShowErrorTip: (err, errorTip) => {
        if (errorTip !== false) {
            handleErrorMessage(err);
        }
    },
    onShowSuccessTip: (response, successTip) => {
        if (successTip !== false) {
            message.success(successTip, 3);
        }
    },
    isMock,
});

const store = configureStore();

function App() {
    return (
        <Provider store={store}>
            <Router />
        </Provider>
    );
}

ReactDOM.render(<App />, document.getElementById('main'));
