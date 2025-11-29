const path = require('path');
const GasPlugin = require('gas-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'Code.js',
    libraryTarget: 'this', // GAS のグローバルに載せる
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new GasPlugin(),
    new NodePolyfillPlugin(),
  ],
};
