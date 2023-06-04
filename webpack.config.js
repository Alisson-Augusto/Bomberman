const path = require('path');

module.exports = {
  entry: './dist/index.js',
  devtool: 'inline-source-map', // ou 'source-map',
  mode: "development",
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};