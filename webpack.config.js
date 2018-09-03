const path = require('path');
var glob = require("glob");

module.exports = {
  entry: glob.sync('./src/**/*.js'),
  mode: 'development',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public')
  }
};
