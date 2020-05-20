const webpack = require('webpack')
const stackConfig = require('./stack.config.js')

const APP_NAME = stackConfig.name
const PORT = stackConfig.port
const PROXY = stackConfig.proxy

const NODE_ENV = process.env.NODE_ENV || 'development'

log('APP_NAME: ', APP_NAME)
log('NODE_ENV: ', NODE_ENV)

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  configureWebpack: {
    entry: './src/main.js',
    externals: {
      // vue: 'Vue',
      // moment: 'moment',
      // 'element-ui': 'ELEMENT',
      // vant: 'vant'
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.VUE_APP_NAME': JSON.stringify(APP_NAME)
      }),
      new webpack.optimize.MinChunkSizePlugin({
        minChunkSize: 50 * 1024 // ~50KB, before compression
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          elementUI: {
            name: 'chunk-elementUI', // 单独将 elementUI 拆包
            priority: 20, // 权重要大于 libs 和 app 不然会被打包进 libs 或者 app
            test: /[\\/]node_modules[\\/]element-ui[\\/]/
          }
        }
      }
    }
  },
  devServer: {
    port: PORT,
    proxy: PROXY
  }
}

function log (label, content) {
  console.log('\x1b[1m%s\x1b[31m%s\x1b[0m', label, content)
}
