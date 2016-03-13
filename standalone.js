'use strict'

var spawn = require('child_process').spawn

console.error()
console.error(new Date())

// Attempt to spawn the child as tap would, hooking up the same event listeners.
var child = spawn(process.execPath, ['child.js'])
child.on('error', function (err) {
  console.error('main: child errored', err && err.stack || err)
})

child.on('close', function (code, signal) {
  console.error('main: child closed', code, signal)
  process.exit(code)
})

child.stdout.on('data', function (c) {
  process.stdout.write(c)
})
child.stdout.on('end', function () {
  console.error('main: child.stdout ended')
})
child.stderr.on('data', function (c) {
  process.stderr.write(c)
})
