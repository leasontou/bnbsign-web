const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  lintOnSave: false,
  
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: config => {
    if (process.env.NODE_ENV !== 'production') return
    return {
      plugins: [
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
