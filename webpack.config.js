const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

let PROD = 0;//JSON.parse(process.env.PROD_ENV || '0');
let pathTo = {
    dist: path.resolve(__dirname, 'dist'),
    js: path.resolve(__dirname, 'src/js'),
    sass: path.resolve(__dirname, 'src/sass'),
    twig: path.resolve(__dirname, 'src/twig'),
};

module.exports = {

    entry: pathTo.js + '/main.js',
    output: {
        filename: PROD ? 'main.min.js' : 'main.js',
        path: pathTo.dist
    },

    plugins: PROD ? [
            new ExtractTextPlugin('main.css'),
            new webpack.ProvidePlugin({$: 'jquery', Twig: 'twig'}),
            new webpack.optimize.UglifyJsPlugin()
        ] : [
            new ExtractTextPlugin('main.css'),
            new webpack.ProvidePlugin({$: 'jquery', Twig: 'twig'}),
        ],

    resolve: { // path to scripts for imports & require in .js
        modules: [pathTo.js, pathTo.sass, pathTo.twig, 'node_modules']
    },

    module: {
        rules: [

            { // it need if we want use Uglify with es6
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },

            { // Extract css
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader!sass-loader',
                })
            },

            {test: /\.(png||svg)$/, loader: 'url-loader?limit=100000' },
            {test: /\.jpg$/, loader: 'file-loader' },
        ]
    }

};