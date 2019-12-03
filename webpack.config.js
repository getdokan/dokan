const webpack = require('webpack');
const path = require('path');
const package = require('./package.json');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' );

// const config = require( './config.json' );

// Naming and path settings
var appName   = 'app';
var vueVendor = Object.keys(package.dependencies);

vueVendor.splice( vueVendor.indexOf( '@wordpress/hooks' ), 1 );

var entryPoint = {
    'vue-frontend': './src/frontend/main.js',
    'vue-admin': './src/admin/main.js',
    'vue-bootstrap': './src/utils/Bootstrap.js',
    'vue-vendor': vueVendor,
    'dokan-wp': './src/wp-packages/index.js',
    // style: './less/style.less',
};

var exportPath = path.resolve(__dirname, './assets/js');

// Enviroment flag
var plugins = [];
var env = process.env.WEBPACK_ENV;

function isProduction() {
    return process.env.WEBPACK_ENV === 'production';
}

// extract css into its own file
const extractCss = new ExtractTextPlugin({
    filename: "../css/[name].css"
});

plugins.push( extractCss );

// Extract all 3rd party modules into a separate 'vendor' chunk
plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'vue-vendor',
    minChunks: ({ resource }) => /node_modules/.test(resource),
}));

// plugins.push(new BrowserSyncPlugin( {
//     proxy: {
//         target: config.proxyURL
//     },
//     files: [
//         '**/*.php'
//     ],
//     cors: true,
//     reloadDelay: 0
// } ));

// Generate a 'manifest' chunk to be inlined in the HTML template
// plugins.push(new webpack.optimize.CommonsChunkPlugin('manifest'));

// Compress extracted CSS. We are using this plugin so that possible
// duplicated CSS from different components can be deduped.
plugins.push(new OptimizeCSSPlugin({
    cssProcessorOptions: {
        safe: true,
        map: {
            inline: false
        }
    }
}));

// Differ settings based on production flag
if ( isProduction() ) {

    plugins.push(new UglifyJsPlugin({
        sourceMap: true,
    }));

    plugins.push(new webpack.DefinePlugin({
        'process.env': env
    }));

    appName = '[name].min.js';
} else {
    appName = '[name].js';
}

module.exports = {
    entry: entryPoint,
    output: {
        path: exportPath,
        filename: appName,
        chunkFilename: 'chunks/[chunkhash].js',
        jsonpFunction: 'dokanWebpack'
    },

    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': path.resolve('./src/'),
            'frontend': path.resolve('./src/frontend/'),
            'admin': path.resolve('./src/admin/'),
        },
        modules: [
            path.resolve('./node_modules'),
            path.resolve(path.join(__dirname, 'src/')),
        ]
    },

    externals: {
        jquery: 'jQuery',
        'chart.js': 'Chart',
        moment: 'moment'
    },

    plugins,

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve( 'babel-loader' ),
                        options: {
                            // Babel uses a directory within local node_modules
                            // by default. Use the environment variable option
                            // to enable more persistent caching.
                            cacheDirectory: process.env.BABEL_CACHE_DIRECTORY || true,
                        },
                    },
                ],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: true
                }
            },
            {
                test: /\.less$/,
                use: extractCss.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }]
                })
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
}
