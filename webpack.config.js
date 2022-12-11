const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin

module.exports = {
    entry: [
        path.resolve(__dirname, 'index.ts'),
    ],

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                mangle: {
                    properties: {
                        regex: /^_/
                    }
                }
            }
        })],
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "publisher-subscriber.min.js",
        library: {
            name: 'PubSub',
            type: "umd"
        },
        globalObject: "this"
    },

    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['babel-loader', 'ts-loader'],
                exclude: /node_modules/
            }
        ]
    },

    plugins: [
        new BundleAnalyzerPlugin()
    ],


    mode: 'production'
};
