const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './public/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '/'
    },
    experiments: {
        asyncWebAssembly: true,
        topLevelAwait: true
    },
    resolve: {
        fallback: {
            "fs": false,
            "path": false,
            "crypto": false
        }
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000,
        proxy: [{
            context: ['/api'],
            target: 'http://localhost:3001',
            secure: false,
            changeOrigin: true,
            headers: {
                Connection: 'keep-alive'
            },
            proxyTimeout: 60000,
            timeout: 60000
        }],
        client: {
            webSocketURL: 'auto://0.0.0.0:0/ws'
        },
        hot: true,
        historyApiFallback: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader'
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.wasm$/,
                type: 'webassembly/async'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
        }),
    ],
}