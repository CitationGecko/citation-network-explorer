const path = require('path');
const glob = require("glob");
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin");

module.exports = {
  entry: glob.sync('./src/**/*.js'),
  mode: 'development',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    plugins: [
      new DirectoryNamedWebpackPlugin()
    ]
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public')
  }
};
