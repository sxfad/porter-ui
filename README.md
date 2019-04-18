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

安装流程移步[安装步骤](https://yarnpkg.com/zh-Hans/docs/install)

### 运行porter-ui

#### api接口地址配置

通过api-config.js修改dev、test、rc、production环境下manager-boot的接口地址
```
module.exports = {
	api:'/api/manager',
}
```

#### dev环境下的开发模式
无需打包静态页面，部署静态代理。http proxy 默认端口是8080,详见package.json关于scripts->dev的配置。

```
    yarn & yarn run dev
```

#### 命令

| 命令                 | 描述                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `yarn run dev`          | 开发模式                                         |
| `yarn run build`        | 打包静态页面                                                 |


| 环境变量                 | 描述                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `cross-env API=接口地址`    |  优先级高于api-config.js配置的接口地址              |
| `cross-env OUTPUT=目录`    | 打包后静态页面输出位置                               |
| `cross-env HTTP_PORT=端口号`    |优先级高于package.json 开发模式http server端口号  |

## 打包

运行打包命令后，静态页面会被默认输出到public目录下:
```
 yarn & yarn run build 
```