import path from 'path';
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'production',
    entry: {
        main: './src/index.js'
    },
    output: {
        filename: 'assets/js/[name].bundle.js',
        chunkFilename: 'assets/js/[name].chunk.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: '/',
        assetModuleFilename: 'assets/[name][ext]'
    },
    devtool: 'source-map',
    externals: {
        'plotly.js-dist': 'Plotly'
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                compress: {
                    drop_console: false,
                },
            },
        })],
        splitChunks: {
            chunks: 'all',
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    priority: -20
                }
            }
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    browsers: ['last 2 versions', 'not dead']
                                },
                                modules: false,
                                useBuiltIns: 'usage',
                                corejs: 3
                            }]
                        ],
                        plugins: ['@babel/plugin-syntax-dynamic-import'],
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'assets/styles/output.css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: 'public',
                    globOptions: {
                        ignore: [
                            '**/styles/**',
                        ],
                    },
                    to: '[path][name][ext]',
                },
                {
                    from: 'public/js',
                    to: 'js'
                }
            ],
        }),
    ],
    cache: {
        type: 'filesystem'
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080,
        proxy: [{
            context: ['/api'],
            target: 'http://localhost:3000',
        }],
    },
};