var IoReactor = require("./");
var util = require('util');

var logger = function(severity, origin, message) {
    console.log(severity + ' ' + origin + ' ' + message);
};

var reactorConfig = {
  logFunction: logger,
  chokidar: {
      watcher: {
          watchPaths:['/tmp/test1'],
          alwaysStat: true
      }
  }
};


//console.log(util.inspect(reactorConfig));


var reactor = new IoReactor(reactorConfig);
