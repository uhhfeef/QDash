import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'development',
    devtool: 'source-map',
    entry: './public/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
        clean: false,
        publicPath: ''
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
        },
        extensions: ['.js', '.mjs', '.cjs', '.json'],
        alias: {
            '@config': path.resolve(__dirname, 'config'),
            '@public': path.resolve(__dirname, 'public')
        },
        modules: ['node_modules', path.resolve(__dirname, 'config')]
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
            cookieDomainRewrite: 'localhost',
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
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
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
            minify: false
        }),
    ],
}