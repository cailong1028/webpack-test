/*global module, require, __dirname, process*/
const path = require('path');

const glob = require('glob');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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

let statsPath = path.resolve(__dirname, './dist/__stats');
const bundleAnalyzerPlugin = new BundleAnalyzerPlugin({
    // Can be `server`, `static` or `disabled`.
    // In `server` mode analyzer will start HTTP server to show bundle report.
    // In `static` mode single HTML file with bundle report will be generated.
    // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
    analyzerMode: 'static',
    // Host that will be used in `server` mode to start HTTP server.
    analyzerHost: '127.0.0.1',
    // Port that will be used in `server` mode to start HTTP server.
    analyzerPort: 4000,
    // Path to bundle report file that will be generated in `static` mode.
    // Relative to bundles output directory.
    reportFilename: path.resolve(statsPath, 'report.html'),
    // Automatically open report in default browser
    openAnalyzer: false,//default true
    // If `true`, Webpack Stats JSON file will be generated in bundles output directory
    generateStatsFile: true,
    // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
    // Relative to bundles output directory.
    statsFilename: path.resolve(statsPath, 'stats.json'),
    // Options for `stats.toJson()` method.
    // For example you can exclude sources of your modules from stats file with `source: false` option.
    // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
    statsOptions: null,
    // Log level. Can be 'info', 'warn', 'error' or 'silent'.
    logLevel: 'info'
}); //打包分析插件

let vendorEntryName = '__vendor__', commonsEntryName = '__commons__', entry = {}, entryNamePrefix = 'app/', defaultEntryIndex = 'index/index';
entry[entryNamePrefix+vendorEntryName] = ['underscore', 'react', 'react-dom'/*, './public/script/vendor/jquery/dist/jquery.min'*/];
let entryFiles = glob.sync(path.resolve(__dirname, './app/script/*/index*.js'));
entryFiles.forEach((oneFile) => {
    let entryName = /app\/script\/(.*\/index[0-9a-zZ-Z|_]*)\.js/.exec(oneFile)[1];
    entry[entryNamePrefix+entryName] = oneFile;
});

let plugins = [
    new webpack.BannerPlugin('版权所有: cailong@gmail.com'),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),

    //除了vendor部分，其他公用部分都打到__commons.js
    // 效果等同于下面两个CommonsChunkPlugin同时执行
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: entryNamePrefix+vendorEntryName,
        //     // async: true
        // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: entryNamePrefix+commonsEntryName,
    //     minChunks: 2,
    // }),
    new webpack.optimize.CommonsChunkPlugin({
        //表示将非vendor的所有入库模块的公共部分打入__commons.js，vendor入口则不打入__commons入口
        //官网意思很明确“如果传递一个字符串数组，这等于为每个块名称多次调用插件”，所以相当于是设置了两个CommonsChunkPlugin，
        //  但是否存在vendor打包进common（pageA等可能引用vendor，但是vendor不会引用自身，故不存在公共模块，肯定不会打进common），
        //  当name值和entry入口相同的时候（vendor），此时就是取到抽离chunk的目的。
        //参考 https://www.jianshu.com/p/f1cd7019acf8
        names: [entryNamePrefix+commonsEntryName, entryNamePrefix+vendorEntryName, 'manifest'],
        //公共模块被调用多少次才会被打入公共模块包，默认是当前入库模块数量，比如entry中非vendor的模块数量为3，
        //则minChunks为3，所以这里要手动设定为固定的2
        //如果没有公用部分则不生成__commons.js
        minChunks: 2,
        // filename: 'commons.js', //options.name的时候可以定义filename，但是options.names的时候不要使用
        // chunks: ['_index2', '_index3'] //按块名称选择源块。 块必须是公共块的子节点。 如果省略，则选择所有条目块。
    }),

    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './app/index.tmpl.html'),
        //只需要加载启动页面的chunk
        // chunks: [entryNamePrefix+defaultEntryIndex]
    }),
    new CleanWebpackPlugin('dist/*', {
        root: __dirname,
        verbose: true,
        dry: false,
    }),
    new webpack.DefinePlugin({
        ctx: 'context2_2'
    }),
    new webpack.ProvidePlugin({
        _: 'underscore',
        // $: 'jquery'
    }),
    bundleAnalyzerPlugin,
];

//非开发环境压缩
if(process.env.NODE_ENV.trim() !== 'development'){
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
    }));
    uglifyCss = true;
}

plugins.push(new ExtractTextPlugin('./[name].[chunkhash:8]'+(uglifyCss ? '.min' : '')+'.css'));

let rules = [
    {
        test: /(\.js|\.jsx)$/,
        use: {
            loader: 'babel-loader',
        },
        include: /app/,
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
    entry: entry,
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].[hash:8]'+(process.env.NODE_ENV.trim() === 'development' ? '' : '.min')+'.js',
        //chunkFilename: '[name].[hash:8]'+(process.env.NODE_ENV.trim() === 'development' ? '' : '.min')+'.js',
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