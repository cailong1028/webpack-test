/*global module, require, __dirname, process*/
const path = require('path');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

let sourceMapType = '', uglifyCss = false;
switch (process.env.NODE_ENV.trim()){
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

let plugins = [
    new webpack.BannerPlugin('版权所有: cailong@gmail.com'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),

    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './app/index.tmpl.html')
    }),
    new CleanWebpackPlugin('dist/*.*', {
        root: __dirname,
        verbose: true,
        dry: false,
    }),
];

//非开发环境压缩
if(process.env.NODE_ENV.trim() !== 'development'){
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
    }));
    uglifyCss = true;
}

plugins.push(new ExtractTextPlugin('./[name].[chunkhash:8]'+(uglifyCss ? '.min' : '')+'.css'));

var rules = [
    {
        test: /(\.js|\.jsx)$/,
        use: {
            loader: 'babel-loader',
        },
        exclude: /node_modules/
    },
    {
        test: /(\.css|\.scss|\.less$)/,
        include: /app/,
        exclude: /(node_modules|bower_components)/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{
                loader: 'css-loader',
                options: {
                    minimize: uglifyCss, //压缩
                    modules: true, // 指定启用css modules
                    localIdentName: '[name]-[hash:5]' // 指定css的类名格式
                }
            },'sass-loader', 'less-loader']
        }),
    }
];

module.exports = {
    // entry: path.resolve(__dirname, 'app/index.js'),
    entry: {
        _index: path.resolve(__dirname, 'app/index.js'),
        underscore: ['underscore']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[hash:8]'+(process.env.NODE_ENV.trim() === 'development' ? '' : '.min')+'.js'
    },
    devtool: sourceMapType,
    devServer: {
        contentBase: path.resolve(__dirname, './dist'), //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        inline: true, //实时刷新
        hot: true,
        port: 3000,
    },
    module: {rules: rules},
    plugins: plugins
};