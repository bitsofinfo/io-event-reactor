
var IoReactorService = require("./");
var EvaluatorUtil = require('./ioReactor').EvaluatorUtil;
var util = require('util');

var logger = function(severity, origin, message) {
    //if (severity != 'trace') {
        console.log(severity + ' ' + origin + ' ' + message);
    //}
};

var errorCallback = function(message,error) {
    //console.log("ERROR-CALLBACK! " + message + ' ' + error);
};

var config = {
  logFunction: logger,
  errorCallback: errorCallback,

  ioReactors: [

        {
            name: "ioReactor-test1",

            monitor: {

                    plugin: "../io-event-reactor-plugin-chokidar",
                    paths: ['/tmp/test1'],
                    options: {
                        alwaysStat: false,
                        awaitWriteFinish: {
                            stabilityThreshold: 200,
                            pollInterval: 100
                        }
                    }
            },

            reactors: [
                { plugin: "./default_plugins/logger/loggerReactorPlugin" }
            ],

            evaluators: [
                {
                    evaluator: EvaluatorUtil.regex(['change'],'.*test\\d+.txt.*','ig'),
                    reactors: ['logger']
                }
            ]

        }

   ]
};


var reactor = new IoReactorService(config);
