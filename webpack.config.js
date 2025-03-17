const path = require( 'path' );
const { VueLoaderPlugin } = require( 'vue-loader' );
const entryPoints = require( './webpack-entries' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const isProduction = process.env.NODE_ENV === 'production';
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const requestToExternal = ( request ) => {
    const match = request.match( /^@dokan\/stores\/(.+)$/ );
    if ( match ) {
        return [ 'dokan', match[ 1 ] + '-store' ];
    }
    // Add more custom mappings as needed
};

const requestToHandle = ( request ) => {
    const match = request.match( /^@dokan\/stores\/(.+)$/ );
    if ( match ) {
        return `dokan-stores-${ match[ 1 ] }`;
    }
    // Add more custom mappings as needed
};

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
            '@dokan/root': path.resolve( './' ),
            frontend: path.resolve( './src/frontend/' ),
            admin: path.resolve( './src/admin/' ),
        },
    },

    externals: {
        jquery: 'jQuery',
        'chart.js': 'Chart',
        moment: 'moment',
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
