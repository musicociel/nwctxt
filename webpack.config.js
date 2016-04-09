const webpack = require("webpack");
const path = require("path");

module.exports = {
  devtool: "source-map",
  entry: "./src/index.js",
  output: {
    library: "nwctxt",
    libraryTarget: "umd",
    path: path.join(__dirname, "dist"),
    filename: "nwctxt.js"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel"
    }]
  },
  plugins: [new webpack.optimize.UglifyJsPlugin()]
};
