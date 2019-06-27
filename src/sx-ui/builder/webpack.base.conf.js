var path = require('path')
var webpack = require('webpack')
var config = require('./config')
var utils = require('./utils')
var projectRoot = config.projectRoot;
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var merge = require('webpack-merge')

var babelPlugins = ['add-module-exports', 'typecheck', 'transform-runtime', 'transform-decorators-legacy', ["import", config.babelImport]];
if (process.env.NODE_ENV === 'testing') {
    babelPlugins.unshift('__coverage__');
}

var babelQuery = {
    cacheDirectory: true,
    presets: ['es2015', 'react', 'stage-0'],
    plugins: babelPlugins,
    comments: false
};

var preLoaders = [
    {
        test: /routes\.js$/,
        loader: path.join(__dirname, './routes-loader') + '!eslint',
        include: projectRoot,
        exclude: /node_modules/
    }
];

if (config.useESLint) {
    preLoaders.push(
        {
            test: /\.js(x)*$/,
            loader: 'eslint',
            include: projectRoot,
            exclude: /(node_modules|routs\.js)/
        }
    );
}


var baseConf = {
    cache: true,
    output: {
        path: config.build.assetsRoot,
        publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
        filename: '[name].js'
    },
    resolve: {
        fallback: [path.join(__dirname, '../node_modules')],
    },
    resolveLoader: {
        fallback: [path.join(__dirname, '../node_modules')]
    },
    module: {
        preLoaders: preLoaders,
        loaders: [
            {
                test: /\.js(x)*$/,
                loader: 'babel',
                include: projectRoot,
                exclude: /node_modules[\\/](?!(sx-ui)[\\/]).*/, // sx-ui需要webpack构建 exclude: /node_modules\/(?!(MY-MODULE|ANOTHER-ONE)\/).*/,
                query: babelQuery
            },
            {
                test: /\.json$/,
                loader: 'json'
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css?sourceMap&-restructuring!' + 'postcss-loader')
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('css?sourceMap!' + 'postcss-loader!' + 'less?{"sourceMap":true,"modifyVars":{}}')
            },
            {
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                },
            },
        ]
    },
    plugins: [
        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        new webpack.optimize.OccurenceOrderPlugin(),
        new ExtractTextPlugin(utils.assetsPath('css/[name].[contenthash].css'), {
            disable: false,
            allChunks: true
        }),
    ],
    eslint: {
        formatter: require('eslint-friendly-formatter')
    },
    // // TODO 文件大小有改变，但是速度并没有提升
    /*plugins: [
     new webpack.DllReferencePlugin({
     context: __dirname,
     manifest: require('./dll/manifest.json'),
     }),
     ],*/
};

module.exports = merge(baseConf, config.webpack.base);
