var chokidar = require('chokidar');
var util = require('util');

class IoReactor {

    constructor(config) {

        this.logFunction = config.logFunction;

        this.watcher = chokidar.watch(config.chokidar.watcher.watchPaths,
            {
              ignored: /[\/\\]\./,
              persistent: true,
              alwaysStat: config.chokidar.watcher.alwaysStat,
              awaitWriteFinish: {
                  stabilityThreshold: 10000,
                  pollInterval: 1000
              }
            }
        );

        this.watcher.on('all',this.handleAll.bind(this));
        this.watcher.on('add',this.handleAdd.bind(this));
        this.watcher.on('change',this.handleChange.bind(this));
        this.watcher.on('unlink',this.handleUnlink.bind(this));
        this.watcher.on('addDir',this.handleAddDir.bind(this));
        this.watcher.on('unlinkDir',this.handleUnlinkDir.bind(this));
        this.watcher.on('ready',this.handleReady.bind(this));
        this.watcher.on('raw',this.handleRaw.bind(this));
        this.watcher.on('error',this.handleError.bind(this));
    }

    handleAll(event,path) {
        this.logFunction('info','IoReactor',event + ' ' + path);
    }

    handleError(error) {
        this.logFunction('info','IoReactor',util.inspect(error));
    }

    handleAdd(path,stats) {
        this.logFunction('info','IoReactor','ADD ' + path + ' ' + util.inspect(stats));
    }

    handleChange(path,stats) {
        this.logFunction('info','IoReactor','CHANGE ' + path + ' ' + util.inspect(stats));
    }

    handleUnlink(path) {
        this.logFunction('info','IoReactor','UNLINK ' + path);
    }

    handleUnlinkDir(path) {
        this.logFunction('info','IoReactor','UNLINKDIR ' + path);
    }

    handleAddDir(path,stats) {
        this.logFunction('info','IoReactor','ADDDIR ' + path + ' ' + util.inspect(stats));
    }

    handleReady() {
        this.logFunction('info','IoReactor','READY');
    }

    handleRaw(event, path, details) {
        this.logFunction('info','IoReactor','RAW ' + event + ' ' + path + ' ' + util.inspect(details));
    }
}


module.exports = IoReactor;
