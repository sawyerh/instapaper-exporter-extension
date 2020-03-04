"use strict";
let path = require("path");
let webpack = require("webpack");
let config;

const file = function(name) {
  return `./src/assets/js/${name}`;
};

const backgroundScriptPaths = [file("background/runtime")];
const contentScriptPaths = [file("content-script")];

config = {
  entry: {
    "dist/chrome/extension/assets/js/background": backgroundScriptPaths,
    "dist/chrome/extension/assets/js/content-script": contentScriptPaths
  },
  output: {
    path: "./",
    filename: "[name].min.js"
  },
  module: {
    loaders: [
      {
        test: /\.(jsx|js)?$/,
        loader: "babel",
        exclude: /(node_modules|dist|external)/
      }
    ]
  },
  eslint: {
    configFile: path.join(__dirname, ".eslintrc.js")
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"' + process.env.NODE_ENV + '"'
      }
    })
  ],
  resolve: {
    // Search in these directories for modules too:
    root: [
      path.join(__dirname, "src/assets/js"),
      path.join(__dirname, "src/assets/css")
    ],
    extensions: ["", ".js", ".jsx", ".css"]
  }
};

if (process.env.NODE_ENV === "production") {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      sourceMap: false
    })
  );
}

module.exports = config;
