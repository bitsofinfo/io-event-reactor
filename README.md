# io-event-reactor

Node.js module for reacting to filesystem events by invoking plugins that match configurable evaluators.

[![NPM](https://nodei.co/npm/io-event-reactor.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/io-event-reactor/)

## How it works

The basic concept is this; you have a `monitor` that listens for IO events for particular paths
on the filesystem. As these IO events occur, they are passed on to one or more `evaluators` to
decide whether or not the `IoEvent` should be reacted to by one or more configured `reactors`.
The entire latter sequence is encapsulated in an `IoReactor` instance that manages the flow
between the three described components.

![Alt text](/docs/diag1.png "Diagram1")

With this module, you construct and configure a single `IoReactorService` which can manage and contain
one or more `IoReactor` instances, as many as you wish, providing for lots of flexibility for reacting to filesystem events.

![Alt text](/docs/diag2.png "Diagram2")


### Install

`npm install io-event-reactor`

### Requirements

* [Node](https://nodejs.org/en/) 4.4.5+

### Plugin support
* [io-event-reactor-plugin-support](https://github.com/bitsofinfo/io-event-reactor-plugin-support) - Required module for developing any plugin

### Monitor plugins
* [io-event-reactor-plugin-chokidar](https://github.com/bitsofinfo/io-event-reactor-plugin-chokidar) - Monitor the filesystem for changes using [Chokidar](https://github.com/paulmillr/chokidar)

### Reactor plugins
* [code](default_plugins/code) - Permits arbitrary execution of javascript
* [logger](default_plugins/logger) - Log reactions to monitored events
* [io-event-reactor-plugin-shell-exec](https://github.com/bitsofinfo/io-event-reactor-plugin-shell-exec) - Exec shell commands via [stateful-process-command-proxy](https://github.com/bitsofinfo/stateful-process-command-proxy)
* [io-event-reactor-plugin-mysql](https://github.com/bitsofinfo/io-event-reactor-plugin-mysql) - Exec SQL against data in MySql via [node-mysql](https://github.com/felixge/node-mysql)


### Unit tests

To run the unit tests go to the root of the project and run the following.

```
mocha test/all.js
```
