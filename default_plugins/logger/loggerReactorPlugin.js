var util = require('util');

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

    getName() {
        return 'logger';
    }

    react(ioEventType, fullPath, optionalFsStats, optionalExtraInfo) {
        this._log('info',"REACT["+getName()+"]() invoked: " + ioEventType + " for: " + fullPath);
    }

    /**
    *  Helper log function
    *  will set origin = this class' name
    */
    _log(severity,message) {
        //console.log(severity + ' ' + message);
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
