const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const sourcePath = path.resolve(__dirname, '../', 'src');

module.exports = {
    cache: true,
    entry: {
        app: './src/App.jsx',
        login: './src/pages/login/Login.jsx',
    },
    resolve: {
        extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
        modules: [path.resolve(__dirname, '../', 'node_modules'), sourcePath],
        alias: {
            src: path.resolve(__dirname, '../', 'src'),
            'sx-ui': path.resolve(__dirname, '../', 'src', 'sx-ui'),
        },
    },
    module: {
        rules: [
            // 去掉eslint
            // {
            //     test: /\.(js|jsx)$/,
            //     exclude: /node_modules[\\/](?!(sx-ui)[\\/]).*/, // sx-ui需要webpack构建 exclude: /node_modules\/(?!(MY-MODULE|ANOTHER-ONE)\/).*/,
            //     enforce: "pre",
            //     loader: "eslint-loader",
            //     options: {
            //         cache: true,
            //     }
            // },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: ['happypack/loader'],
            },
            {
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/image/[name]-[hash:8].[ext]',
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/font/[name]-[hash:8].[ext]',
                },
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {NODE_ENV: JSON.stringify(process.env.NODE_ENV)}
        }),
        new HappyPack({
            loaders: ['babel-loader?cacheDirectory=true'],
        }),
    ],
};
