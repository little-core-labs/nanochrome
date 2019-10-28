const { Process } = require('nanoprocess')
const chrome = require('chrome-launcher')
const url = require('url')

// quick util
const errback = (p, cb) => void p.then((r) => cb(null, r), cb).catch(cb)
const isString = (s) => 'string' === typeof s

/**
 * The `Chrome` class represents a `nanoprocess` abstraction over
 * a Chrome Browser process launched with the 'chrome-launcher'
 * module.
 * @public
 * @class
 * @extends Process
 */
class Chrome extends Process {

  /**
   * Generates an intermediate script for resizing and centering
   * the Chrome Browser window.
   * @param {String} uri
   * @param {Object} opts
   * @return {String}
   */
  static bootscript(uri, opts) {
    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    const header = 'data:text/html,<html><body><script>'
    const footer = '</script></body></html>'
    const body = opts.body || `
      r=${opts.aspect || 16/9}; /** aspect ratio */
      s=${opts.scale || 0.4}; /** scale */
      m=${opts.max || 800}; /** max */
      w=Math.max(m*r,r*s*screen.width); /** width */
      h=Math.max(m-60,r*s*screen.height); /** height */
      x=(0.5*screen.width)-(0.5*w); /** x coord */
      y=(0.5*screen.height)-(0.5*h); /** y coord */
      resizeTo(w,h); /** scale */
      moveTo(x,y); /** translation */
      location='${uri}'; /** redirection */
    `

    return header + trim(body) + footer

    function trim(s) {
      return s.trim().split('\n').map(l => l.trim()).join('')
    }
  }

  /**
   * `Chrome` class constructor
   * @public
   * @param {String} uri
   * @param {Object} opts
   */
  constructor(uri, opts) {
    if ('object' === typeof uri) {
      uri = String(new url.URL(uri)) // ensure URI from object
    }

    super(uri, opts)
  }

  /**
   * Extends `Process#spawn()` to handle the custom opening of the
   * Chrome Browser process with the 'chrome-launcher' module.
   * @protected
   */
  spawn(uri, args, opts, callback) {
    opts = Object.assign({}, opts) // copy

    if (false === Array.isArray(opts.chromeFlags)) {
      opts.chromeFlags = [ opts.chromeFlags ].filter(isString)
    }

    if (true === opts.app) {
      let hasAppFlag = false
      for (const flag of opts.chromeFlags) {
        if (flag.startsWith('--app')) {
          hasAppFlag = true
          break
        }
      }

      if (false === hasAppFlag) {
        // use a bit of JavaScript as an intermediate to clean up
        // the launched chrome frame before redirecting to the URI
        const bootscript = this.constructor.bootscript(uri, opts)
        opts.chromeFlags.push('--app=' + bootscript)
      }
    } else {
      opts.startingUrl = uri
    }

    if (opts.headless) {
      // istanbul ignore next
      if (false === opts.chromeFlags.includes('--headless')) {
        opts.chromeFlags.push('--headless')
      }
    }

    // launch and return the spawned child process to the caller
    return errback(chrome.launch(opts), onbrowser)

    function onbrowser(err, browser) {
      // istanbul ignore next
      if (err) { return callback(err) }

      // return `browser.process` to the `spawn()` caller that came
      // from `chrome.launch()`
      process.nextTick(callback, null, browser.process)

      // call `browser.kill()` when the browser process
      // closes so the 'chrome-launcher' module can clean up
      // the 'SIGTERM' event handler and remove the browser
      // instance from its internal memory
      browser.process.once('close', onclose)
      function onclose() {
        // silent killer, ignore err
        errback(browser.kill(), (err) => {
          void err
        })
      }
    }
  }
}

/**
 * Factory for creating `Chrome` instances.
 * @param {String} uri
 * @param {Object} opts
 * @return {Chrome}
 */
function createChrome(...args) {
  return new Chrome(...args)
}

/**
 * Module exports.
 */
module.exports = Object.assign(createChrome, {
  Chrome,
})
