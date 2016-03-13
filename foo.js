'use strict'

process.on('message', function (m) {
  if (m === 'bye') {
    // Matches how the child process exits in AVA:
    // <https://github.com/sindresorhus/ava/blob/v0.13.0/lib/test-worker.js#L127:L134>
    setTimeout(function () {
      process.exit(0)
    }, 0)
  }
})

// Matches AVA's behavior when an uncaught exception is thrown, like
// <https://github.com/sindresorhus/ava/blob/v0.13.0/test/fixture/with-dependencies/test-uncaught-exception.js#L11:L13>
setImmediate(function () {
  process.send('hello')
})
