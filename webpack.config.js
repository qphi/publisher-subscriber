const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'index.ts'),
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
        extensions: ['.ts']
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

    mode: 'production'
};