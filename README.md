# io-event-reactor

Node.js module for reacting to filesystem events by invoking plugins that match configurable conditions

Note, this project uses Ecmascript 6 class definition syntax, you need to run node 4.4.5 + w/ `node --use-strict test.js`

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
