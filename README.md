# sx-admin
sx-admin 管理系统模板，UI基于antd，完整的登录、退出登录、菜单等结构

## Prepare
前端开发前期准备工作

### 需要学习的技术
1. [es6](http://es6.ruanyifeng.com/) 重点：2、3、7、8、9、14、19、20、22
1. [react](https://facebook.github.io/react/) state props 周期函数 jsx
1. [UI antd](https://ant.design/index-cn)

### 需要安装的软件
1. [nodejs](http://nodejs.cn/)
1. [yarn](https://yarnpkg.com/zh-Hans/)
1. [git](https://git-scm.com/)

## Build Setup
> 使用[yarn](https://yarnpkg.com/zh-Hans/)

``` bash
# install dependencies
$ yarn

# serve with hot reload at localhost:8080
yarn run dev

# build for production with minification
yarn run build:prod


# build for rc with minification
yarn run build:rc

# build for test with minification
yarn run build:test

# clear cache 如果发现源码与webpack编译文件明显不一致，有可能是缓存脏数据
yarn run clear-dev-cache

```

## 部署配置文件
ajax-config.js
test、rc、production环境下ajax配置文件。如无无特殊情况，无需修改。

## 本地文件
个性化配置，防止各个开发人员冲突

local/local-ajax-base-url.js
```
/*
 * 开发模式下ajax base url 单独提出文件，并git ignore，防止开发人员之间冲突
 * */
export default 'http://172.16.135.168:8080/';

```
local/local-build-config.js
```
/*
 * 只开发模式有效
 * 部分构建的本地化配置，满足不同人不同配置，而不产生冲突
 * */

const path = require('path');
const srcPath = './src';

module.exports = {
    routesIgnore: [ // 忽略文件，不进行构建，提供部分模块打包功能
        // '**/ActionsExample.jsx',
    ],
    pagePath: path.join(srcPath, 'pages/**/*.jsx'), // 使用了PAGE_ROUTE INIT_STATE 文件所在目录，与routesIgnore同样可以控制打包模块
    // pagePath: path.join(srcPath, '**/*.jsx'),
}
```

## 系统菜单激活状态
> 系统菜单的激活状态根据url地址，自动判定

- 如果是二级页面，不如添加页面，需要保持其父级页面菜单状态，菜单path需要写成`parentPath/+childPath`，使用`/+`作为分界，比如：
```
list页面：
export const PAGE_ROUTE = '/example/users'

list页面的添加按钮，跳转到添加页面，但是页面菜单选中状态要保持list页面状态

export const PAGE_ROUTE = '/example/users/+add'
```

## 页面头部
> 页面头部可以控制显示隐藏、修改标题、修改面包屑

### 显示隐藏
```
componentWillMount() {
    const {actions} = this.props;
    actions.hidePageHeader();
}

```

### 修改标题
```
componentWillMount() {
    const {actions} = this.props;
    actions.setPageTitle('自定义页面标题');
}
```

### 自定义面包屑导航
```
componentWillMount() {
    const {actions} = this.props;
    actions.setPageBreadcrumbs([
        {
            key: 'zidingyi',
            path: '',
            text: '自定义',
            icon: 'fa-user',
        },
        {
            key: 'mianbaoxie',
            path: '',
            text: '面包屑',
            icon: 'fa-user',
        },
        {
            key: 'daohang',
            path: '',
            text: '导航',
            icon: 'fa-user',
        },
    ]);
}
```

## 页面写法
> 为了简化开发，通过脚本自动生成部分代码，需要注意几个约定

### 路由
> 页面导出 PAGE_ROUTE 常量即可，常量的值对应菜单的path

```
export const PAGE_ROUTE = '/example/users';

// 如果二级页面保持父级页面菜单选中状态，二级页面路由约定：parent_page_route/+child_page_route，通过`/+`进行分割
export const PAGE_ROUTE = '/example/users/+add';
```

## 前后端分离 ngnix配置 参考
```
# 服务地址
upstream api_service {
  server localhost:8080;
  keepalive 2000;
}
#
server {
        listen       80;
        server_name  localhost;
        location / {
          root /home/app/nginx/html; // 前端打包之后的文件存放路径
          index index.html;
          try_files $uri $uri/ /index.html; #react-router 防止页面刷新出现404
        }
        location ^~/api { // 代理ajax请求，前端的ajax请求配置了统一的baseUrl = ‘/api’
           proxy_pass http://api_service/;
           proxy_set_header Host  $http_host;
           proxy_set_header Connection close;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-Server $host;
        }
}
```

## TODO
- [x] 登录之后，获取菜单数据，并存入session中，由于页面头部是由菜单生成的，如果菜单是异步获取的，将会存在各种问题，所以进入系统时候保证菜单可用;
- [x] 构建优化：css postcss的使用，自动添加前缀等功能;
- [x] css module功能，antd不是module方式，如果使用module，antd less 构建会失败。 可以根据需求来定哪些模块使用css module，哪些不使用;
- [x] 根据需求来选择Frame框架，带tab页和不带tab两种模式，可以嵌套iframe来对接外部系统;

# clear cache 如果发现源码与webpack编译文件明显不一致，有可能是缓存脏数据
yarn run clear-dev-cache

```

## 本地文件
个性化配置，防止各个开发人员冲突

local/local-ajax-base-url.js
```
/*
 * 开发模式下ajax base url 单独提出文件，并git ignore，防止开发人员之间冲突
 * */
export default 'http://172.16.135.168:8080/';

```
local/local-build-config.js
```
/*
 * 只开发模式有效
 * 部分构建的本地化配置，满足不同人不同配置，而不产生冲突
 * */

const path = require('path');
const srcPath = './src';

module.exports = {
    routesIgnore: [ // 忽略文件，不进行构建，提供部分模块打包功能
        // '**/ActionsExample.jsx',
    ],
    pagePath: path.join(srcPath, 'pages/**/*.jsx'), // 使用了PAGE_ROUTE INIT_STATE 文件所在目录，与routesIgnore同样可以控制打包模块
    // pagePath: path.join(srcPath, '**/*.jsx'),
}
```

## 系统菜单激活状态
> 系统菜单的激活状态根据url地址，自动判定

- 如果是二级页面，不如添加页面，需要保持其父级页面菜单状态，菜单path需要写成`parentPath/+childPath`，使用`/+`作为分界，比如：
```
list页面：
export const PAGE_ROUTE = '/example/users'

list页面的添加按钮，跳转到添加页面，但是页面菜单选中状态要保持list页面状态

export const PAGE_ROUTE = '/example/users/+add'
```

## 页面头部
> 页面头部可以控制显示隐藏、修改标题、修改面包屑

### 显示隐藏
```
componentWillMount() {
    const {actions} = this.props;
    actions.hidePageHeader();
}

```

### 修改标题
```
componentWillMount() {
    const {actions} = this.props;
    actions.setPageTitle('自定义页面标题');
}
```

### 自定义面包屑导航
```
componentWillMount() {
    const {actions} = this.props;
    actions.setPageBreadcrumbs([
        {
            key: 'zidingyi',
            path: '',
            text: '自定义',
            icon: 'fa-user',
        },
        {
            key: 'mianbaoxie',
            path: '',
            text: '面包屑',
            icon: 'fa-user',
        },
        {
            key: 'daohang',
            path: '',
            text: '导航',
            icon: 'fa-user',
        },
    ]);
}
```

## 页面写法
> 为了简化开发，通过脚本自动生成部分代码，需要注意几个约定

### 路由
> 页面导出 PAGE_ROUTE 常量即可，常量的值对应菜单的path

```
export const PAGE_ROUTE = '/example/users';

// 如果二级页面保持父级页面菜单选中状态，二级页面路由约定：parent_page_route/+child_page_route，通过`/+`进行分割
export const PAGE_ROUTE = '/example/users/+add';
```

## 前后端分离 ngnix配置 参考
```
# 服务地址
upstream api_service {
  server localhost:8080;
  keepalive 2000;
}
#
server {
        listen       80;
        server_name  localhost;
        location / {
          root /home/app/nginx/html; // 前端打包之后的文件存放路径
          index index.html;
          try_files $uri $uri/ /index.html; #react-router 防止页面刷新出现404
        }
        location ^~/api { // 代理ajax请求，前端的ajax请求配置了统一的baseUrl = ‘/api’
           proxy_pass http://api_service/;
           proxy_set_header Host  $http_host;
           proxy_set_header Connection close;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-Server $host;
        }
}
```

## TODO
- [x] 登录之后，获取菜单数据，并存入session中，由于页面头部是由菜单生成的，如果菜单是异步获取的，将会存在各种问题，所以进入系统时候保证菜单可用;
- [x] 构建优化：css postcss的使用，自动添加前缀等功能;
- [x] css module功能，antd不是module方式，如果使用module，antd less 构建会失败。 可以根据需求来定哪些模块使用css module，哪些不使用;
- [x] 根据需求来选择Frame框架，带tab页和不带tab两种模式，可以嵌套iframe来对接外部系统;
