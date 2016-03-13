# AVA + Tap Crash

This repository contains an isolated reproduction of an intermittent test
failure of [AVA](https://github.com/sindresorhus/ava)'s test suite. AVA uses
[`tap`](https://github.com/tapjs/node-tap) to run its own tests.

## Background

AVA [forks child
processes](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options)
as it runs test files. It uses IPC to coordinate test runs. Notably it doesn't
kill the child process outright, instead sending an `ava-exit` message which
causes the child process to exit asynchronously, using `setTimeout()` with a
delay value of `0`.

The [failing
test](https://github.com/sindresorhus/ava/blob/v0.13.0/test/api.js#L652:L682)
launches four child processes. One of these uses `setImmediate` to
asynchronously throw an uncaught exception. After some back and forth over the
IPC channel AVA tells that child process to exit. Occasionally this happens
before the other processes are ready.

Normally, once all processes are ready, AVA tells them to run their tests. It
does not track which processes it had previously told to exit, causing it to
send such processes further IPC messages (not sending those messages caused the
failure to go away).

Node throws an exception when sending an IPC message to a closed channel.
However there seems to be a rare condition where no exception is thrown. Instead
the test process spawned by `tap` exits with a `SIGPIPE` signal. This causes the
test to fail and prevents further tests from running.

[#1646.2](https://travis-ci.org/sindresorhus/ava/jobs/115088398) shows this
failure under Node 4. Note how `test/api.js` only gets to 105 out of 107
assertions. [#1646.1](https://travis-ci.org/sindresorhus/ava/jobs/115088397)
passes under Node 5. Here `test/api.js` runs 121 assertions. Additionally the
error seems to be attributed to the [next
test](https://github.com/sindresorhus/ava/blob/v0.13.0/test/api.js#L684), which
is incorrect. The problem isn't specific to Node 4, see
[#1651.1](https://travis-ci.org/sindresorhus/ava/jobs/115261117) for Node 5 and
[#1600.3](https://travis-ci.org/sindresorhus/ava/jobs/114056416) for Node 0.12.

## Reproduction

### `tap`

I have only been able to reproduce this problem when the test process is spawned
by `tap`. To reproduce it on your machine fork this repo and run `npm install`.
Then:

```console
$ npm run reproduce-tap
```

This will repeatedly run a test from `tap.js`, until the test fails:

```
tap.js
foo -> child: hello
bar -> child: hello
1..0
  1) test count !== plan
  2) tap.js

  0 passing (374.931ms)
  2 failing

  1) tap.js runner test count !== plan:

      test count !== plan
      + expected - actual

      -0
      +2



  2) tap.js:
     tap.js
```

I can reproduce this using Node 0.10.42, 0.12.12, 4.4.0 and 5.8.0, all on OS X
10.11.3.

### Standalone

`standalone.js` tries to spawn `child.js` like `tap` does in order to reproduce
the problem without using `tap`. Use:

```console
$ npm run reproduce-standalone
```

I haven't been able to detect a failure this way.

## Final thoughts

I've tried to add logs for the child exiting or Node throwing but these logs
don't report anything when the spawned process exits with the `SIGPIPE` signal.
However if you log the signal in `tap` itself (modify [this
line](https://github.com/tapjs/node-tap/blob/8ebc428cd4e96428d4e6f28c16940402288fd397/lib/test.js#L851))
you'll see how the child exits with a `SIGPIPE`.

I've added comments to explain how AVA's behavior is reproduced or simplified.

In the end this may be a Node issue but I haven't been able to reproduce it
without `tap`. Any help is appreciated!
