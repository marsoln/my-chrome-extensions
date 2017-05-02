var webpack = require('webpack')
var path = require('path')

module.exports = {
    entry: './index.js',
    output: {
        filename: 'main.js',
    },
    resolve: {
        root: [
            path.resolve('./'),
        ]
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel'
        }]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
}