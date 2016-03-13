'use strict'

process.on('message', function (m) {
  if (m === 'bye') {
    // Note that in AVA the child process exits with a 0ms timeout, but that
    // doesn't seem necessary here.
    // <https://github.com/sindresorhus/ava/blob/v0.13.0/lib/test-worker.js#L127:L134>
    process.exit(0)
  }
})

// The failing test starts a child that asynchronously throws an uncaught exception,
// which then causes a message to be sent to the main process:
// <https://github.com/sindresorhus/ava/blob/v0.13.0/test/fixture/with-dependencies/test-uncaught-exception.js#L11:L13>
// This asynchronicity is not necessary to reproduce this crash.
process.send('hello')
