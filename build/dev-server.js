require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')
var axios = require('axios')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()

// axios 结合 node.js 代理后端请求
var apiRoutes = express.Router()
apiRoutes.get('/getList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(function (response) {
      res.json(response.data)
    })
    .catch(function (error) {
      console.log(error)
    })
})
apiRoutes.get('/getSongList', function (req, res) {
  var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    var ret = response.data
    debugger
    if (typeof ret === 'string') {
      var reg = /{.*}/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[0])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})
// 歌词
apiRoutes.get('/getLyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  axios.get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then((response) => {
      // jsonp 数据转为 json 数据
      var result = response.data

      if (typeof result === 'string') {
        var reg = /^\w+\(({[^()]+})\)$/
        var matches = result.match(reg)

        if (matches) {
          result = JSON.parse(matches[1])
        }
      }

      res.json(result)
    })
    .catch((error) => {
      console.log(error)
    })
})

// 搜索
apiRoutes.get('/search', function (req, res) {
  var url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  })
    .then((response) => {
      // jsonp 数据转为 json 数据
      var result = response.data
      if (typeof result === 'string') {
        var reg = /\(.*\)/
        result = result.replace(/(\r\n)|(\n)/g, '')
        var matches = result.match(reg)

        if (matches) {
          var str = matches[0]
          result = JSON.parse(str.substring(1, str.length-1))
        }
      }
      res.json(result)
    })
    .catch((error) => {
      console.log(error)
    })
})
app.use('/api', apiRoutes)

var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {},
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
