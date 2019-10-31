const test = require('tape')
const http = require('http')
const path = require('path')
const url = require('url')

const { Chrome } = require('./')
const nanochrome = require('./')

test('const chrome = nanochrome(url[, opts])', (t) => {
  const server = http.createServer((req, res) => {
    res.end('hello')
  })

  server.listen(0, 'localhost', (err) => {
    t.error(err)
    const { port } = server.address()
    const uri = url.format({ protocol: 'http:', hostname: 'localhost', port })
    const chrome = nanochrome(uri, { headless: true })
    chrome.open((err) => {
      t.notOk(err)
      chrome.close((err) => {
        t.notOk(err)
        server.close((err) => {
          t.error(err)
          t.end()
        })
      })
    })
  })
})

test('nanochrome() - app', (t) => {
  const server = http.createServer((req, res) => {
    res.end('hello')
  })

  server.listen(0, (err) => {
    t.error(err)
    const { port } = server.address()
    const uri = url.format({ protocol: 'http:', hostname: 'localhost', port })
    const chrome = nanochrome(uri, {
      app: true,
      chromeFlags: [ '--disable-gpu' ]
    })

    chrome.open((err) => {
      t.notOk(err)
      chrome.close((err) => {
        t.notOk(err)
        server.close((err) => {
          t.error(err)
          t.end()
        })
      })
    })
  })
})

test('nanochrome() - app flag precedence', (t) => {
  const server = http.createServer((req, res) => {
    t.ok(
      '/from-chrome-flags' === req.url ||
      '/favicon.ico' === req.url)
    res.end('hello')
  })

  server.listen(0, 'localhost', (err) => {
    t.error(err)
    const { port } = server.address()
    const uri = new url.URL(url.format({
      protocol: 'http:', hostname: 'localhost', port
    }))

    const chrome = nanochrome(uri, {
      app: true,
      chromeFlags: [
        `--app=${path.join(String(uri), '/from-chrome-flags')}`
      ]
    })

    chrome.open((err) => {
      t.notOk(err)
      chrome.close((err) => {
        t.notOk(err)
        server.close((err) => {
          t.error(err)
          t.end()
        })
      })
    })
  })
})

test('Chrome.bootscript(uri[, opts])', (t) => {
  t.ok('function' === typeof Chrome.bootscript)
  const string = Chrome.bootscript('https://google.com')
  t.ok('string' === typeof string)
  t.end()
})
