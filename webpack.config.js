/*global module, require, __dirname, process*/
const path = require('path');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

let sourceMapType = '';
switch (process.env.NODE_ENV){
    case 'development':
        sourceMapType = 'eval-source-map';
        break;
    case 'production':
        sourceMapType = 'source-map';
        break;
    default:
        sourceMapType = 'null';
        break
}

module.exports = {
    entry: {
        main: path.join(__dirname, 'app/index.js'),
        underscore: ['underscore']
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name]-[hash].js'
    },
    devtool: sourceMapType,
    devServer: {
        contentBase: path.join(__dirname, './dist'), //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        inline: true, //实时刷新
        hot: true,
        port: 3000,
    },
    module: {
        rules: [
            {
                test: /(\.js|\.jsx)$/,
                use: {
                    loader: 'babel-loader',
                },
                exclude: /node_modules/
            },
            {
                test: /(\.css|\.scss$)/,
                use: [{
                    loader: 'style-loader'
                },{
                    loader: 'css-loader',
                    options: {
                        modules: true, // 指定启用css modules
                        localIdentName: '[name]__[local]--[hash:base64:5]' // 指定css的类名格式
                    }
                }]
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin('版权所有: cailong@gmail.com'),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin(),

        new ExtractTextPlugin(path.join(__dirname, './dist/main.css')),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '/app/index.tmpl.html')
        }),
        new CleanWebpackPlugin('dist/*.*', {
            root: __dirname,
            verbose: true,
            dry: false,
        }),
    ]
};