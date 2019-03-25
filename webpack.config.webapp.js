module.exports = {
  entry: ['babel-polyfill', './webapp/index.js'],
  output: {
    path: __dirname + '/build',
    publicPath: '/',
    filename: 'webapp.bundle.js'
  },
 mode: "development",
 module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
};
