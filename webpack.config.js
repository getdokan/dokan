const path = require( 'path' );
const { VueLoaderPlugin } = require( 'vue-loader' );
const entryPoints = require( './webpack-entries' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const isProduction = process.env.NODE_ENV === 'production';
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { requestToExternal, requestToHandle } = require( './webpack-dependency-mapping' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const updatedConfig = {
    mode: defaultConfig.mode,
    entry: {
        ...entryPoints,
        components: {
            import: '@dokan/components/index.tsx',
        },
        utilities: {
            import: '@dokan/utilities/index.ts',
        },
        hooks: {
            import: '@dokan/hooks/index.tsx',
        },
    },
    output: {
        path: path.resolve( __dirname, './assets/js' ),
        filename: '[name].js',
        clean: true,
        devtoolNamespace: 'dokan',
        library: {
            name: [ 'dokan', '[name]' ],
            type: 'window',
        },
    },

    resolve: {
        ...defaultConfig.resolve,
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@dokan': path.resolve( './src/' ),
            frontend: path.resolve( './src/frontend/' ),
            admin: path.resolve( './src/admin/' ),
        },
    },

    externals: {
        jquery: 'jQuery',
        'chart.js': 'Chart',
        moment: 'moment',
        '@woocommerce/blocks-registry': [ 'wc', 'wcBlocksRegistry' ],
        '@woocommerce/settings': [ 'wc', 'wcSettings' ],
        '@woocommerce/block-data': [ 'wc', 'wcBlocksData' ],
        '@woocommerce/shared-context': [ 'wc', 'wcSharedContext' ],
        '@woocommerce/shared-hocs': [ 'wc', 'wcSharedHocs' ],
        '@woocommerce/price-format': [ 'wc', 'priceFormat' ],
        '@woocommerce/blocks-checkout': [ 'wc', 'blocksCheckout' ],
        '@dokan/components': [ 'dokan', 'components' ],
        '@dokan/utilities': [ 'dokan', 'utilities' ],
        '@dokan/hooks': [ 'dokan', 'hooks' ],
    },

    plugins: [
        ...defaultConfig.plugins.filter(
            ( plugin ) =>
                plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
        ),
        new MiniCssExtractPlugin( {
            filename: ( { chunk } ) => {
                if ( chunk.name.match( /\/modules\// ) ) {
                    return `${ chunk.name.replace( '/js/', '/css/' ) }.css`;
                }

                return '../css/[name].css';
            },
        } ),

        new VueLoaderPlugin(),
        new DependencyExtractionWebpackPlugin( {
            requestToExternal,
            requestToHandle,
        } ),
    ],

    module: {
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
                        loader: 'css-loader',
                        options: {
                            sourceMap: ! isProduction,
                        },
                    },
                    {
                        loader: 'less-loader',
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
                    filename: '../images/[name][ext][query]',
                },
            },
            {
                test: /\.svg/,
                type: 'asset/inline',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '../font/[name].[ext]',
                },
            },
        ],
    },
};

if ( ! isProduction ) {
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
