const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },
  mode: 'development',

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8000,
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      // favicon: "favicon.ico",
      template: "src/index.html",
    }),
    new HtmlWebpackPlugin({
      filename: "artists.html",
      // favicon: "favicon.ico",
      template: "src/artists.html",
    }),
    new HtmlWebpackPlugin({
      filename: "songs.html",
      // favicon: "favicon.ico",
      template: "src/songs.html",
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          sources: {
            urlFilter: (a, v, p) => {
              if (v == "bundle.js"){
                return false;
              }
              return true
            }
          }
        }
      },
    ],
  },
};