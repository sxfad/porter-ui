import pageState from './page';

const reducers = {
    pageState,
};


export function initReducers(newReducers) {
    Object.keys(newReducers).forEach(key => {
        const oriReducer = reducers[key];
        if (oriReducer) {
            throw Error(`不予许定义同名的reducer：${key}`);
        } else {
            reducers[key] = newReducers[key];
        }
    });
}

export default reducers;
