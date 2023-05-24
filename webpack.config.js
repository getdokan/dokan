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
  ...defaultConfig,
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
    ...defaultConfig.module,
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
    ]
  },
}
