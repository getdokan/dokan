const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const DependencyExtractionWebpackPlugin = require( '@woocommerce/dependency-extraction-webpack-plugin' );
const path = require('path');

const entryPoint = {
  'aun-payment/aun-payment': './src/blocks/aun-payment/index.js',
}

  module.exports = {
  ...defaultConfig,
  mode: defaultConfig.mode,
  entry: entryPoint,
  output: {
    path: path.resolve(__dirname, './assets/blocks'),
    filename: '[name].js',
    clean: true,
  },
  plugins: [
    ...defaultConfig.plugins.filter(
      ( plugin ) =>
        plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
    ),
    new DependencyExtractionWebpackPlugin(),
  ],
};
