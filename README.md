nanochrome
==========

> Launch a Chrome Browser as a [nanoprocess][nanoprocess] that leverages
> [chrome-launcher][chrome-launcher].

## Installation

```sh
$ npm install nanochrome
```

## Status

> **Stable**

## Usage

```js
const nanochrome = require('nanochrome')

const chrome = nanochrome('https://example.com')

chrome.open((err) => {
  // chrome browser window opened
})
```

## API

### `const chrome = nanochrome(uri[, options])`

Creates a new `Chrome` ([nanoprocess][nanoprocess]) instance from `uri`
with optional `options` that are passed directly to
[`chrome.launch()`][chrome-launcher]. `options` can also be:

```js
{
  app: false, // set to `true` to launch URI in application mode (--app=)
  headless: false, // set `true` to run headless (--headless)
}
```

_See [Chrome Flags for
Tools](https://github.com/GoogleChrome/chrome-launcher/blob/HEAD/docs/chrome-flags-for-tools.md) for a complete list of useful flags that can be passed in the `opts.chromeFlags` array_.

#### `chrome.open([callback])`

Opens the Google Chrome browser calling `callback(err)` upon success or
error.

#### `chrome.close([callback])`

Closes the Google Chrome browser calling `callback(err)` upon success or
error.

## See Also

- [nanoprocess][nanoprocess]
- [nanoresource][nanoresource]
- [chrome-launcher][chrome-launcher]

## License

MIT


[nanoprocess]: https://github.com/little-core-labs/nanoprocess
[nanoresource]: https://github.com/mafintosh/nanoresource
[chrome-launcher]: https://github.com/GoogleChrome/chrome-launcher
