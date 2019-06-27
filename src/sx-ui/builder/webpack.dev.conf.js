var config = require('./config')
var path = require('path');
var webpack = require('webpack')
var merge = require('webpack-merge')
var utils = require('./utils')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var HtmlWebpackPlugins = [];
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
    // add hot-reload related code to entry chunks
    baseWebpackConfig.entry[name] = [path.join(__dirname, './dev-client')].concat(baseWebpackConfig.entry[name]);
    var htmlOptions = config.htmlOptions[name];
    HtmlWebpackPlugins.push(
        new HtmlWebpackPlugin({
            chunks: [name],
            favicon: htmlOptions.favicon,
            filename: htmlOptions.fileName,
            template: htmlOptions.template,
            inject: true,
            title: htmlOptions.title,
        })
    );
});

module.exports = merge(baseWebpackConfig, {
    // eval-source-map is faster for development
    devtool: '#eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {NODE_ENV: config.dev.env}
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
    ].concat(HtmlWebpackPlugins),
}, config.webpack.dev);
