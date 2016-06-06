
var IoReactorService = require("./");
var EvaluatorUtil = require('./ioReactor').EvaluatorUtil;
var util = require('util');

var logger = function(severity, origin, message) {
    if (/*severity != 'trace' && */severity != 'verbose') {
        console.log(severity + ' ' + origin + ' ' + message);
    }
};

var errorCallback = function(message,error) {
    //console.log("ERROR-CALLBACK! " + message + ' ' + error);
};

var config = {

  logFunction: logger,
  errorCallback: errorCallback,

  ioReactors: [

        {
            id: "ioReactor-test1",

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

            evaluators: [
                {
                    evaluator: EvaluatorUtil.regex(['change'],'.*test\\d+.txt.*','ig'),
                    reactors: ['logger1','shellExec1']
                }
            ],

            reactors: [
                { id: "logger1",
                  plugin: "./default_plugins/logger/loggerReactorPlugin" },

                { id: "shellExec1",
                  plugin: "../io-event-reactor-plugin-shell-exec",
                  config: {
                          statefulProcessCommandProxy: {
                              name: "ioReactor-test1-shell-exec",
                              max: 2,
                              min: 2,
                              idleTimeoutMS: 120000,
                              logFunction: logger,
                              processCommand: '/bin/bash',
                              processArgs:  ['-s'],
                              processRetainMaxCmdHistory : 10,
                              processCwd : './',
                              processUid : null,
                              processGid : null,
                              validateFunction: function(processProxy) {
                                  return processProxy.isValid();
                              }
                          },

                          commandTemplates: [
                              'echo "{{{ioEventType}}} for fullPath: {{{fullPath}}}, parentPath:{{{parentPath}}}, filename:{{{filename}}} stats.size: {{{optionalFsStats.size}}}"'
                          ],

                          commandGenerator: function(ioEventType, fullPath, optionalFsStats, optionalExtraInfo) {
                            return ('myCommand ' + ioEventType + '->' + fullPath + '[' + optionalFsStats.size +']');
                          },
                      }
                }
            ]

        }

   ]
};


var reactor = new IoReactorService(config);
