Porter UI
===============

## 开发

UI构建自[yarn](https://yarnpkg.com).

### 获取代码

拉取porter-ui分支代码并进入porter-ui目录

```
 git clone https://github.com/sxfad/porter-ui.git
 cd porter-ui
```

安装yarn环境依赖

安装流程移步[安装步骤](https://yarn.bootcss.com/docs/install)

### 运行porter-ui

#### api接口地址配置

通过api-config.js修改dev、test、rc、production环境下manager-boot的接口地址
```
export default  {
    'production': '/api/manager',
    'test': 'http://127.0.0.1:8080/api/manager',
    'rc': '/api/manager',
    'dev': 'http://127.0.0.1:8080/api/manager'
}
```

#### dev环境下的开发模式
无需打包静态页面，部署静态代理。http proxy 默认端口是8080,详见package.json关于scripts->dev的配置。

```
    yarn & yarn run dev
```

#### 命令

| Command                 | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `yarn run dev`          | "dev"环境下的开发模式                                         |
| `yarn run build:prod`   | 打包生产环境静态页面                                           |
| `yarn run build:rc`     | 打包仿真环境静态页面                                           |
| `yarn run build:test`   | 打包测试环境静态页面                                           |
| `yarn run clear-dev-cache`   | 清理缓存                                                |



## 打包

运行打包命令后，静态页面会被输出到public目录下:
```
 yarn & yarn run build:环境
```