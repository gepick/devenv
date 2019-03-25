const path = require('path');

module.exports = {
  entry: ['babel-polyfill','./httpserver/server.js'],
  mode:'production',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'build')
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
 },
 node: {
  fs: 'empty',
  __dirname: false
 }
};
