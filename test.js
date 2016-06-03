var IoReactorService = require("./");
var util = require('util');

var logger = function(severity, origin, message) {
    console.log(severity + ' ' + origin + ' ' + message);
};

var errorCallback = function(message,error) {
    console.log("ERROR-CALLBACK! " + message + ' ' + error);
};

var config = {
  logFunction: logger,
  errorCallback: errorCallback,

  ioReactors: [

        {
            name: "ioReactor-test1",

            monitor: {

                    plugin: "io-event-reactor-plugin-chokidar",
                    paths: ['/tmp/test1'],
                    options: {
                        alwaysStat: true,
                        awaitWriteFinish: {
                            stabilityThreshold: 1000,
                            pollInterval: 1000
                        }
                    }
            }
        }

   ]
};


var reactor = new IoReactorService(config);
