'use strict'

var fork = require('child_process').fork

module.exports = function (onExit) {
  var foo = fork('./foo.js', {
    silent: true // https://github.com/sindresorhus/ava/blob/v0.13.0/lib/fork.js#L35
  })
  var bar = fork('./bar.js', {
    silent: true
  })

  process.on('exit', function (code, signal) {
    // Once you reproduce the crash, note how this line didn't log anything.
    console.error('child exited', code, signal)
  })

  foo.on('exit', function (code, signal) {
    console.error('child: foo exited', code, signal)
    onExit('foo')
  })

  bar.on('exit', function (code, signal) {
    console.error('child: bar exited', code, signal)
    onExit('bar')
  })

  foo.on('message', function (m) {
    console.error('foo -> child:', m)
    if (m === 'hello') {
      // Tell foo to exit. AVA sends a 'teardown' message to which the child
      // responds, after which AVA sends the 'exit' message. This test has less
      // back and forth.
      foo.send('bye')
    }
  })

  bar.on('message', function (m) {
    console.error('bar -> child:', m)
    if (m === 'hello') {
      try {
        // Attempt to send a message to foo, synchronously from when a message
        // was received from bar. AVA does the same (through some indirection).
        foo.send('poke')
      } catch (err) {
        // Once you reproduce the crash, note how this line didn't log anything.
        console.error(err)
      }
    }
  })
}
