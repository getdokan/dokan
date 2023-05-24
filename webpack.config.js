const path = require('path');
const package = require('./package.json');
const {VueLoaderPlugin} = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

var vueVendor = Object.keys(package.dependencies);

vueVendor.splice( vueVendor.indexOf( '@wordpress/hooks' ), 1 );

var entryPoint = {
  'vue-frontend': './src/frontend/main.js',
  'vue-admin': './src/admin/main.js',
  'vue-bootstrap': './src/utils/Bootstrap.js',
  'vue-vendor': vueVendor,
  'dokan-wp': './src/wp-packages/index.js',
  'dokan-promo-notice': './src/promo-notice/main.js',
  'reverse-withdrawal': './assets/src/js/reverse-withdrawal.js',
  'product-category-ui': './assets/src/js/product-category-ui.js',
  'dokan-admin-product': './assets/src/js/dokan-admin-product.js',
  'dokan': [
    './assets/src/js/product-editor.js',
    './assets/src/js/script.js',
    './assets/src/js/store-lists.js',
    './assets/src/js/withdraw.js'
  ],
  'login-form-popup': './assets/src/js/login-form-popup.js',
  'dokan-maps-compat': './assets/src/js/dokan-maps-compat.js',
  'dokan-admin': './assets/src/js/admin.js',
  'dokan-setup-no-wc': [
    './assets/src/js/setup-no-wc.js'
  ],
  'helper': './assets/src/js/helper.js',
  'dokan-frontend': './assets/src/js/dokan-frontend.js',

  'style': '/assets/src/less/style.less',
  'rtl': '/assets/src/less/rtl.less',
  'admin': '/assets/src/less/admin.less',
  'plugin': '/assets/src/less/plugin.less',
  'global-admin': '/assets/src/less/global-admin.less',
  'setup': '/assets/src/less/setup.less',
  'setup-no-wc': [
    '/assets/src/less/setup-no-wc.less'
  ],
  'reverse-withdrawal': '/assets/src/less/reverse-withdrawal.less',
  'dokan-product-category-ui': '/assets/src/less/dokan-product-category-ui.less',
  'dokan-admin-product': '/assets/src/less/dokan-admin-product.less',
};

const plugins = [
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

  new VueLoaderPlugin(),
];

module.exports = {
  mode: defaultConfig.mode,
  entry: entryPoint,
  output: {
    path: path.resolve(__dirname, './assets/js'),
    filename: '[name].js',
  },

  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve('./src/'),
      'frontend': path.resolve('./src/frontend/'),
      'admin': path.resolve('./src/admin/'),
    },
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
        loader: 'babel-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.(less|css)$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(bmp|png|jpe?g|gif|webp|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: '../images/[name][ext][query]'
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: '../font/[name].[ext]',
        },
      },
    ]
  },
}
