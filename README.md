# porter-ui
porter数据同步中间件的管理后台前端

## Prepare Work

```
$ wget https://services.gradle.org/distributions/gradle-4.10.2-bin.zip  
$ unzip -d /opt/gradle gradle-4.10.2-bin.zip  
$ ln -s /opt/gradle/bin/gradle /usr/bin  
$ wget https://nodejs.org/dist/v10.13.0/node-v10.13.0-linux-x64.tar.xz   
$ tar xvf -C /usr/local/node node-v10.13.0-linux-x64.tar.xz  
$ ln -s /usr/local/node/bin/node /usr/bin/node  
$ ln -s /usr/local/node/bin/npm /usr/bin/npm  
$ npm install yarn -g  
$ ln -s /usr/local/node/bin/yarn /usr/bin/yarn  
```

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

## deploy for nginx 

ajax-config.js
test、rc、production环境下ajax配置文件。如无无特殊情况，无需修改。

$ git clone https://github.com/sxfad/porter-ui.git  
$ cd porter  
$ yarn run build:prod  

```
#nginx config
server {  
        listen 80;    
        server_name  localhost;    
        location /api {  
        #manager-boot所在IP，默认本机   
        proxy_pass http://127.0.0.1:8081;   
        }  
        location / {  
        #配置网站根目录，即打包生成的public文件夹  
		root   /usr/local/webapps/porterui/public;    
        index  index.html;  
        }  
}  
```
Let's go visit http://localhost/ , default user/password : admin/admin  


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
