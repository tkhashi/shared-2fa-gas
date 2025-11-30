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
    environment: { // 互換性のためにアロー関数を避ける
      arrowFunction: false,
    },
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
  optimization: {
    minimize: true,
    minimizer: [
      new (require('terser-webpack-plugin'))({
        terserOptions: {
          format: {
            comments: false, // すべてのコメントを削除
          },
        },
        extractComments: false, // LICENSEファイルを生成しない
      }),
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),
    new GasPlugin(),
  ],
};
