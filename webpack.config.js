const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development', // change to expression based on env variables
  devtool: 'source-map', // git ignore everything in dist
  devServer: {
    contentBase: path.join(__dirname),
  },
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }],
  },
};
