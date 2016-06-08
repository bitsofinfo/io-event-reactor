var IoReactorService = require("io-event-reactor");
var EvaluatorUtil = require('io-event-reactor/ioReactor').EvaluatorUtil;

// IoReactorService configuration
var config = {
  ioReactors: [
        {   id: "reactor1",
            monitor: {
                plugin: "io-event-reactor-plugin-chokidar",
                config: {
                    paths: "/tmp/myapp",
                    options: {
                        alwaysStat: false,
                        awaitWriteFinish: {
                            stabilityThreshold: 200,
                            pollInterval: 100
                        },
                        ignoreInitial:true
                    }
                }
            },

            evaluators: [
                {
                    evaluator: EvaluatorUtil.regex(['add','change','unlink','unlinkDir','addDir'],'.*bitsofinfo.*','ig'),
                    reactors: ['code1']
                }
            ],

            reactors: [
                { id: "code1",
                  plugin: "./default_plugins/code/codeReactorPlugin",
                  config: {
                      codeFunction: function(ioEvent) {
                          return new Promise(function(resolve,reject){
                             console.log("I just reacted to an IoEvent! type: " +ioEvent.eventType + " file: " +ioEvent.fullPath);
                          });
                      }
                  }
                }
            ]
        }
   ]
};

// start the reactor
var reactor = new IoReactorService(config);
