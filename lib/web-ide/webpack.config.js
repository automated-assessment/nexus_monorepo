var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "src") + "/entry.js",
  output: {
    path: path.join(__dirname, "..", "..", "public", "assets"),
    filename: "web-ide.bundle.js"
  },
  resolve: {
    extensions: ["", ".js", ".jsx", ".js.jsx"]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, "src"),
        exclude: /(node_modules)/,
        loader: "babel",
        query: {
          presets: ["react", "es2015", "stage-0"]
        }
      },
      {
        test: require.resolve("react"),
        loader: "expose?React"
      },
      {
        test: require.resolve("react-dom"),
        loader: "expose?ReactDOM"
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
          warnings: false
      }
    })
  ],
  stats: {
    children: false
  }
};
