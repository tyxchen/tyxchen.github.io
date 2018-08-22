const { resolve } = require('path'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin'),
      UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './app/app.js',
    output: {
        path: resolve(__dirname, 'assets', 'static'),
        filename: 'app.js'
    },
    module: {
        rules: [{
            test: /\.css$/,
            include: [ resolve(__dirname, 'app') ],
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader'
            ]
        }]
    },
    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCSSPlugin({})
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    resolve: {
        modules: [
            resolve(__dirname, 'app')
        ]
    }
}
