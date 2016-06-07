
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
                config: {
                    paths: ['/tmp/test1'],
                    options: {
                        alwaysStat: false,
                        awaitWriteFinish: {
                            stabilityThreshold: 200,
                            pollInterval: 100
                        }
                    }
                }
            },

            evaluators: [
                {
                    evaluator: EvaluatorUtil.regex(['change'],'.*test\\d+.txt.*','ig'),
                    reactors: ['code1','logger1','shellExec1','mysql1']
                }
            ],

            reactors: [

                { id: "code1",
                  plugin: "./default_plugins/code/codeReactorPlugin",
                  config: {
                      codeFunction: function(ioEvent) {
                          return new Promise(function(resolve,reject){
                              var dateFormat = require('dateformat');
                              ioEvent.context.timestamp = dateFormat(new Date(), "yyyymmdd_hhMMssL");
                              resolve(true);
                          });
                      }
                  }
                },

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
                              'echo "{{{ioEvent.eventType}}} for fullPath: {{{ioEvent.fullPath}}}, parentPath:{{{ioEvent.parentPath}}}, filename:{{{ioEvent.filename}}} stats.size: {{{ioEvent.optionalFsStats.size}}}"'
                          ],

                          commandGenerator: function(ioEvent) {
                            return [('myCommand ' + ioEvent.eventType + '->' + ioEvent.fullPath + '[' + (ioEvent.optionalFsStats ? ioEvent.optionalFsStats.size : '?') +']')];
                          }
                      }
                },

                { id: "mysql1",
                  plugin: "../io-event-reactor-plugin-mysql",
                  config: {
                        poolConfig : {
                          host     : 'localhost',
                          user     : 'root',
                          password : '123',
                          database : 'testdb'
                        },

                        sqlTemplates: [
                            'INSERT INTO testtable (context,file,type) VALUES("{{{ioEvent.context.timestamp}}}","{{{ioEvent.filename}}}","{{{ioEvent.eventType}}}")'
                        ],

                        sqlGenerator: function(ioEvent) {
                            return [('INSERT INTO testtable (context,file,type) VALUES("'+ioEvent.context.timestamp+'","'+ioEvent.fullPath+'","'+ioEvent.eventType+'")')];
                        },
                    }
                }
            ]

        }

   ]
};


var reactor = new IoReactorService(config);
