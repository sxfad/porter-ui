# porter-ui
porter数据同步中间件的管理后台前端

## Prepare
前端开发前期准备工作


## Build Setup

使用[yarn](https://yarnpkg.com/zh-Hans/)


### install dependencies
$ yarn

### serve with hot reload at localhost:8080
$ yarn run dev

### build for production with minification
$ yarn run build:prod


### build for rc with minification
$ yarn run build:rc

### build for test with minification
$ yarn run build:test

### clear cache 
$ yarn run clear-dev-cache


## deploy

ajax-config.js
test、rc、production环境下ajax配置文件。如无无特殊情况，无需修改。

### 本地文件

个性化配置，防止各个开发人员冲突

local/local-ajax-base-url.js
```
/*
 * 开发模式下ajax base url 单独提出文件，并git ignore，防止开发人员之间冲突
 * */
export default 'http://127.0.0.1:8080/';

```
local/local-build-config.js
```


