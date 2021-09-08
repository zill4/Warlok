const { join } = require('path')
const { https } = require('firebase-functions')
const { default: next } = require('next')

const nextjsDistDir = join('src', require('./src/next.config.js').distDir)

const nextServer = next({
  dev: false,
  conf: {
    distDir: nextjsDistDir,
  },
})
const nextjsHandle = nextServer.getRequestHandler()

exports.nextjsFunc = https.onRequest((req, res) => {
  return nextServer.prepare().then(() => nextjsHandle(req, res))
})