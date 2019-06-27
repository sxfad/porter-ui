// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path');
var fs = require('fs');
var program = require('commander');

// 从命令行里面获取配置文件
var dest = process.cwd();//返回运行当前脚本的工作目录的路径。
program
    .option('-c, --config <value>', 'set config')
    .parse(process.argv);

var defaultConfigFile = './zk-build-config.js'; // 默认配置文件名，要放在脚本运行目录下。
var configPath = path.join(dest, program.config || defaultConfigFile);
var config = require(configPath);

var pathConfigs = [
    'projectRoot',
    'srcPath',
    'staticPath',
    'assetsRoot',
    'pagePath',
];

var htmlOptionsPaths = [
    'template',
    'favicon',
];

absolutePath(pathConfigs, config);

if (config.htmlOptions) {
    Object.keys(config.htmlOptions).forEach(function (m) {
        var html = config.htmlOptions[m];
        absolutePath(htmlOptionsPaths, html);
    });
}

if (config.webpack && config.webpack.base && config.webpack.base.entry) {
    absolutePath(Object.keys(config.webpack.base.entry), config.webpack.base.entry);
}

if (config.webpack && config.webpack.base && config.webpack.base.alias) {
    absolutePath(Object.keys(config.webpack.base.alias), config.webpack.base.alias);
}

function absolutePath(paths, obj) {
    paths.forEach(function (p) {
        var pathValue = obj[p];
        if (pathValue && !path.isAbsolute(pathValue)) {
            obj[p] = path.join(dest, pathValue);
        }
    })
}


// fs.writeFileSync(path.join(__dirname, '../config.js'), fs.readFileSync(configPath));


var srcPath = config.srcPath;
module.exports = {
    staticPath: config.staticPath,
    projectRoot: config.projectRoot,
    babelImport: config.babelImport,
    htmlOptions: config.htmlOptions,
    webpack: config.webpack,
    sourceFilePath: srcPath,
    routesIgnore: config.routesIgnore,
    jsxFileName: config.pagePath || path.join(srcPath, '**/*.jsx'),
    routesFileName: path.join(srcPath, '**/routes.js'),
    allRoutesFileName: path.join(__dirname, '../route/all-routes.js'),
    pageInitStateFileName: path.join(__dirname, '../redux/page-init-state.js'),
    pageRouteFileName: path.join(__dirname, '../route/page-routes.js'),
    useESLint: config.useESLint === undefined ? true : config.useESLint,
    build: {
        env: '"production"',
        assetsRoot: config.assetsRoot,
        assetsSubDirectory: config.assetsSubDirectory || 'static',
        assetsPublicPath: config.assetsPublicPath,
        productionSourceMap: false,
        // Gzip off by default as many popular static hosts such as
        // Surge or Netlify already gzip all static assets for you.
        // Before setting to `true`, make sure to:
        // npm install --save-dev compression-webpack-plugin
        productionGzip: false,
        productionGzipExtensions: ['js', 'css']
    },
    dev: {
        env: '"development"',
        port: 8080,
        assetsSubDirectory: config.assetsSubDirectory || 'static',
        assetsPublicPath: '/',
        proxyTable: config.proxyTables,
        // CSS Sourcemaps off by default because relative paths are "buggy"
        // with this option, according to the CSS-Loader README
        // (https://github.com/webpack/css-loader#sourcemaps)
        // In our experience, they generally work as expected,
        // just be aware of this issue when enabling this option.
        cssSourceMap: false
    }
}
