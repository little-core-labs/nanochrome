const test = require('tape')
const http = require('http')
const path = require('path')
const url = require('url')

const { Chrome } = require('./')
const nanochrome = require('./')

test('const chrome = nanochrome(url[, opts])', (t) => {
  let chrome
  const server = http.createServer((req, res) => {
    res.end('hello')
    t.pass('request received')
    chrome.close((err) => {
      t.error(err, 'chrome closed without error')
      server.close((err) => {
        t.error(err, 'server closed without error')
        t.end()
      })
    })
  })

  server.listen(0, (err) => {
    t.error(err, 'server started without error')
    const { port } = server.address()
    const uri = url.format({ protocol: 'http:', hostname: 'localhost', port })
    chrome = nanochrome(uri, { headless: true })
    chrome.open((err) => {
      t.error(err, 'chrome opened without error')
    })
  })
})

test('nanochrome() - app', (t) => {
  let chrome
  let shutdownTimeout
  const server = http.createServer((req, res) => {
    res.end('hello')
    t.pass('request received')
    if (!shutdownTimeout) shutdownTimeout = setTimeout(shutdownTest, 100)
  })

  function shutdownTest () {
    chrome.close((err) => {
      t.error(err, 'chrome closed without error')
      server.close((err) => {
        t.error(err, 'server closed without error')
        t.end()
      })
    })
  }

  server.listen(0, (err) => {
    t.error(err, 'server started without error')
    const { port } = server.address()
    const uri = url.format({ protocol: 'http:', hostname: 'localhost', port })
    chrome = nanochrome(uri, {
      app: true,
      chromeFlags: [ '--disable-gpu' ]
    })

    chrome.open((err) => {
      t.error(err, 'chrome opened without error')
    })
  })
})

test('nanochrome() - app flag precedence', (t) => {
  let chrome
  let shutdownTimeout
  const server = http.createServer((req, res) => {
    t.ok(
      '/from-chrome-flags' === req.url ||
      '/favicon.ico' === req.url, 'request received')
    res.end('hello')
    if (!shutdownTimeout) shutdownTimeout = setTimeout(shutdownTest, 100)
  })

  function shutdownTest () {
    chrome.close((err) => {
      t.error(err, 'chrome closed without error')
      server.close((err) => {
        t.error(err, 'server closed without error')
        t.end()
      })
    })
  }

  server.listen(0, (err) => {
    t.error(err, 'server started without error')
    const { port } = server.address()
    const uri = new url.URL(url.format({
      protocol: 'http:', hostname: 'localhost', port
    }))

    chrome = nanochrome(uri, {
      app: true,
      chromeFlags: [
        `--app=${path.join(String(uri), '/from-chrome-flags')}`
      ]
    })

    chrome.open((err) => {
      t.error(err, 'chrome opened without error')
    })
  })
})

test('Chrome.bootscript(uri[, opts])', (t) => {
  t.ok('function' === typeof Chrome.bootscript)
  const string = Chrome.bootscript('https://google.com')
  t.ok('string' === typeof string)
  t.end()
})
