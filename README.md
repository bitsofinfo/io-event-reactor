# io-event-reactor

Node.js module for reacting to filesystem events by invoking plugins that match configurable conditions

Note, this project uses Ecmascript 6 class definition syntax, you need to run node 4.4.5 + w/ `node --use-strict test.js`


### Monitor plugins
* [io-event-reactor-plugin-chokidar](https://github.com/bitsofinfo/io-event-reactor-plugin-chokidar) - Monitor the filesystem for changes using [Chokidar](https://github.com/paulmillr/chokidar)

### Reactor plugins
* [logger](default-plugins/logger) - Simply log reactions to monitored events
* [io-event-reactor-plugin-shell-exec](https://github.com/bitsofinfo/io-event-reactor-plugin-shell-exec) - React to monitored events by executing shell commands via [stateful-process-command-proxy](https://github.com/bitsofinfo/stateful-process-command-proxy)
* [io-event-reactor-plugin-mysql](https://github.com/bitsofinfo/io-event-reactor-plugin-mysql) - React to monitored events by maniulating data in MySql
