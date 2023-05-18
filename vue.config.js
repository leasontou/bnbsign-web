const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack');

module.exports = {
  lintOnSave: false,
  
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: config => {
    // if (process.env.NODE_ENV !== 'production') return
    return {
      resolve: {
        fallback: {
          "fs": false,
          "tls": false,
          "net": false,
          "path": false,
          "zlib": false,
          "http": false,
          "https": false,
          "stream": require.resolve("stream-browserify"),
          "buffer": require.resolve("buffer"),
          "crypto": require.resolve("crypto-browserify"),
          "url": require.resolve("url/"),
          "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
        } 
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
        new CompressionPlugin({
          filename: "[path][base].gz",
          algorithm: "gzip",
          test: /\.(js|css|json|txt|html|svg|ttg|eot|woff|woff2)(\?.*)?$/i,
          threshold: 10240, //byte
          deleteOriginalAssets: false
        }),
        new TerserPlugin({
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log'] // 移除console
            }
          }
        })
      ]
    }
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = "BNBSign";
        return args;
      })
  }
}
