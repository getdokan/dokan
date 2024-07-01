const path = require('path');
const package = require('./package.json');
const {VueLoaderPlugin} = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const isProduction = process.env.NODE_ENV === 'production';

const entryPoint = {
  // Dokan tailwind css
  'dokan-tailwind': './src/tailwind.css',

  'vue-frontend': './src/frontend/main.js',
  'vue-admin': './src/admin/main.js',
  'vue-bootstrap': './src/utils/Bootstrap.js',
  'vue-vendor': [
    './src/utils/vue-vendor.js',
  ],
  'dokan-promo-notice': './src/promo-notice/main.js',
  'reverse-withdrawal': './assets/src/js/reverse-withdrawal.js',
  'product-category-ui': './assets/src/js/product-category-ui.js',
  'dokan-admin-product': './assets/src/js/dokan-admin-product.js',
  'vendor-address': './assets/src/js/vendor-address.js',
  'vendor-registration': './assets/src/js/vendor-registration.js',
  'customize-controls': './assets/src/js/customize-controls.js',
  'customize-preview': './assets/src/js/customize-preview.js',
  'pointers': './assets/src/js/pointers.js',
  'dokan': [
    './assets/src/js/orders.js',
    './assets/src/js/product-editor.js',
    './assets/src/js/script.js',
    './assets/src/js/store-lists.js',
    './assets/src/js/withdraw.js',
    './assets/src/js/dokan-daterangepicker.js'
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
  'setup-no-wc-style': [
    '/assets/src/less/setup-no-wc.less'
  ],
  'reverse-withdrawal-style': '/assets/src/less/reverse-withdrawal.less',
  'dokan-product-category-ui': '/assets/src/less/dokan-product-category-ui.less',
  'dokan-admin-product-style': '/assets/src/less/dokan-admin-product.less',
};

const updatedConfig = {
  mode: defaultConfig.mode,
  entry: entryPoint,
  output: {
    path: path.resolve(__dirname, './assets/js'),
    filename: '[name].js',
    clean: true,
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

  plugins: [
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
