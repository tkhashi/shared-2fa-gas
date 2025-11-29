const path = require('path');
const GasPlugin = require('gas-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'Code.js',
    libraryTarget: 'this', // GAS のグローバルに載せる
  },
  plugins: [
    new GasPlugin(),
    new NodePolyfillPlugin(),
  ],
};
