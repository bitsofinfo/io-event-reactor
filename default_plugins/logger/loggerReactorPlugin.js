var util = require('util');
var ReactorResult = require('../../ioReactor').ReactorResult;

class LoggerReactorPlugin {

    /**
    * Constructor
    *
    * An io-event-reactor ReactorPlugin that just logs what it receives
    *
    * @param reactorName - name of the IoReactor this Monitor plugin is bound to
    * @param logFunction - a function to be used for logging w/ signature function(severity, origin, message)
    * @param initializedCallback - when this ReactorPlugin is full initialized, this callback should be invoked
    *
    * @param pluginConfig - Logger configuration object that contains the following specific options, (NONE!)
    *
    */
    constructor(reactorName,
                logFunction,
                errorCallback,
                initializedCallback,
                pluginConfig) {

        try {
            this._reactorName = reactorName;
            this._logFunction = logFunction;
            this._errorCallback = errorCallback;
            this._initializedCallback = initializedCallback;

        } catch(e) {
            var errMsg = this.__proto__.constructor.name +"["+this._reactorName+"] unexpected error: " + e;
            this._log('error',errMsg);
            this._onError(errMsg,e);
        }

    }

    /**
    * getName() - core ReactorPlugin function
    *
    * @return the short name used to bind this reactor plugin to an Evaluator
    */
    getName() {
        return 'logger';
    }

    /**
    * react() - core ReactorPlugin function
    *
    * This function is required on ReactorPlugin implementations
    *
    * @param ioEventType - one of add, addDir, unlink, unlinkDir, change
    * @param fullPath
    * @param optionalFsStats - https://nodejs.org/api/fs.html#fs_class_fs_stats
    * @param optionalExtraInfo - will vary based on configured ReactorMonitor plugin
    * @return Promise - when fulfilled/returns a result object, on reject an error
    *
    */
    react(ioEventType, fullPath, optionalFsStats, optionalExtraInfo) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self._log('info',"REACT["+self.getName()+"]() invoked: " + ioEventType + " for: " + fullPath);
            resolve(new ReactorResult(true,ioEventType,fullPath,optionalFsStats,optionalExtraInfo,"no message"));
        });
    }

    /**
    *  Helper log function
    *  will set origin = this class' name
    */
    _log(severity,message) {
        this._logFunction(severity,(this.__proto__.constructor.name + '[' + this._reactorName + ']'),message);
    }

    /**
    *  Helper error function
    */
    _onError(errorMessage, error) {
        this._errorCallback(errorMessage, error);
    }

}

module.exports = LoggerReactorPlugin;
