var webpack = require("webpack");
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    app: path.join(__dirname, "app", "assets", "javascripts", "entry.js")
  },
  output: {
    path: path.join(__dirname, "public", "assets"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: ["", ".js", ".scss"]
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: "babel",
        query: {
          stage: 0
        }
      },
      {
        test: /\.woff$/,
        loader: require.resolve('file-loader'),
        query: {
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
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
