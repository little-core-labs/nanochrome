const Chrome = require('./')

const chrome = Chrome('https://example.com', { app: true })
chrome.open((err) => {
  chrome.close()
})
