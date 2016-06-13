var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src", "js", "entry.js"),
  output: {
    path: path.join(__dirname, "dist/assets"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: ["", ".js", ".jsx"]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, "src/js"),
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
      new ExtractTextPlugin("bundle.css", { allChunks: true }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery"
      })
  ],
  stats: {
    children: false
  }
};
