const path = require( 'path' );
const entryPoints = require( './webpack-entries' );
const { VueLoaderPlugin } = require( 'vue-loader' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const isProduction = process.env.NODE_ENV === 'production';
const WooCommerceDependencyExtractionWebpackPlugin = require( '@woocommerce/dependency-extraction-webpack-plugin' );

const updatedConfig = {
    mode: defaultConfig.mode,
    entry: {
        ...entryPoints,
        'components': {
            import: '@dokan/components/index.tsx',
        },
        'utilities': {
            import: '@dokan/utilities/index.ts',
        },
        'hooks': {
            import: '@dokan/hooks/index.tsx',
        },
        'dokan-status': '/src/Status/index.tsx',
    },
    output: {
        path: path.resolve(__dirname, './assets/js'),
        filename: '[name].js',
        clean: true,
        devtoolNamespace: 'dokan',
        library: {
            name: [ 'dokan', '[name]' ],
            type: 'window'
        }
    },

    resolve: {
        ...defaultConfig.resolve,
        fallback: {
            // Reduce bundle size by omitting Node crypto library.
            // See https://github.com/woocommerce/woocommerce-admin/pull/5768
            crypto: 'empty',
            // Ignore fs, path to skip resolve errors for @automattic/calypso-config
            fs: false,
            path: false,
        },
        extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@dokan': path.resolve('./src/'),
            'frontend': path.resolve('./src/frontend/'),
            'admin': path.resolve('./src/admin/'),
            'reports': path.resolve(
                __dirname + '/src/vendor-dashboard/reports'
            ),
        },
    },

    externals: {
        jquery: 'jQuery',
        'chart.js': 'Chart',
        moment: 'moment',
    },

    plugins: [
        ...defaultConfig.plugins,
        new MiniCssExtractPlugin(
            {
                filename: ( { chunk } ) => {
                    if ( chunk.name.match( /\/modules\// ) ) {
                        return `${ chunk.name.replace( '/js/', '/css/' ) }.css`;
                    }

                    return '../css/[name].css';
                },
            }
        ),
        new WooCommerceDependencyExtractionWebpackPlugin(),

        new VueLoaderPlugin(),
    ],

    module: {
        ...defaultConfig.module,
        rules: [
            ...defaultConfig.module.rules,
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.(less)$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: ! isProduction,
                        },
                    },
                    {
                        loader: "less-loader",
                        options: {
                            sourceMap: ! isProduction,
                        },
                    },
                ],
            },
            {
                test: /\.(bmp|png|jpe?g|gif|webp)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '../images/[name][ext][query]'
                },
            },
            {
                test: /\.svg/,
                type: 'asset/inline'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '../font/[name].[ext]',
                },
            }
        ]
    },
}

if (!isProduction) {
    updatedConfig.devServer = {
        devMiddleware: {
            writeToDisk: true,
        },
        allowedHosts: 'all',
        host: 'localhost',
        port: 8887,
        proxy: {
            '/assets/dist': {
                pathRewrite: {
                    '^/assets/dist': '',
                },
            },
        },
    };
}

module.exports = updatedConfig;
