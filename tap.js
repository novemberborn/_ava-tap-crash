'use strict'

var test = require('tap').test

var runner = require('./runner')

test('runner', function (t) {
  t.plan(2)

  // The runner will invoke t.pass() when foo or bar exit. If both exit we'll
  // meet the planned count and the test succeeds.
  runner(t.pass)
})
