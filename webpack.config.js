const path = require( 'path' );
const webpack = require( 'webpack' );
const { VueLoaderPlugin } = require( 'vue-loader' );
const entryPoints = require( './webpack-entries' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const isProduction = process.env.NODE_ENV === 'production';
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const {
    requestToExternal,
    requestToHandle,
} = require( './webpack-dependency-mapping' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const updatedConfig = {
    mode: defaultConfig.mode,
    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [ __filename ],
        },
    },
    watchOptions: {
        ignored: [
            '**/node_modules/**',
            '**/assets/js/**',
            '**/assets/css/**',
            '**/assets/images/**',
            '**/assets/font/**',
        ],
    },
    entry: {
        ...entryPoints,
        components: {
            import: './src/components/index.tsx',
            library: {
                name: [ 'dokan', 'components' ],
                type: 'window',
            },
        },
        utilities: {
            import: './src/utilities/index.ts',
            library: {
                name: [ 'dokan', 'utilities' ],
                type: 'window',
            },
        },
        'react-hooks': {
            import: './src/hooks/index.tsx',
            library: {
                name: [ 'dokan', 'reactHooks' ],
                type: 'window',
            },
        },
    },
    output: {
        path: path.resolve( __dirname, './assets/js' ),
        filename: '[name].js',
        clean: true,
        devtoolNamespace: 'dokan',
        // library: { // Bind every entryChunkName to dokan global window object
        //     name: [ 'dokan', '[name]' ],
        //     type: 'window',
        // },
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
            vue$: 'vue/dist/vue.esm.js',
            '@src': path.resolve( './src/' ),
            frontend: path.resolve( './src/frontend/' ),
            admin: path.resolve( './src/admin/' ),
            reports: path.resolve(
                __dirname + '/src/vendor-dashboard/reports'
            ),
            // Route @wordpress/dataviews/wp (pre-bundled monolith) through the
            // modular build so NormalModuleReplacementPlugin below can swap in
            // the lock-unlock shim. Required for DataForm to work on WP 6.8.
            '@wordpress/dataviews/wp$': path.resolve(
                __dirname,
                'node_modules/@wordpress/dataviews/build-module/index.js'
            ),
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
        // Swap @wordpress/dataviews's internal lock-unlock module for a shim
        // that fills in Validated* controls missing from WP 6.8's
        // @wordpress/components. Forward-compatible with WP 6.9+, where the
        // real controls take precedence via the Proxy in the shim.
        new webpack.NormalModuleReplacementPlugin(
            /@wordpress[\/\\]dataviews[\/\\]build-module[\/\\]lock-unlock\.(js|mjs)$/,
            path.resolve( __dirname, 'src/shims/dataviews-lock-unlock.js' )
        ),
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
