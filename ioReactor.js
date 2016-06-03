var util = require('util');
var IoReactorException = require('./ioReactorException');

class IoReactor {

    /**
    * Constructor(config)
    *
    * Takes a config object with the following structure:
    *
    *      name - REQUIRED name for this reactor
    *
    *      logFunction - OPTIONAL logger function(severity, origin, message) for dealing with errors specific to this reactor, if not provided the default logFunction above will be used
    *      errorCallback - OPTIONAL error handler function(message, sourceErrorObject) for dealing with errors specific to this reactor, if not provided the default errorCallback above will be used
    *
    *      monitor - REQUIRED object configuration for an io-even-reactor "MonitorPlugin" - see available list at: https://github.com/bitsofinfo/io-event-reactor
    *
    *
    */
    constructor(config) {
        this._name = config.name;

        // capture our log function reference
        // and error handler callback
        this._logFunction = config.logFunction; // function(severity, origin, message)
        this._errorCallback = config.errorCallback; // function(message, sourceErrorObject)


        /**
        * #1 Create our MonitorPlugin
        */
        try {
            var MonitorPlugin = require("../"+config.monitor.plugin);

            var monitor = new MonitorPlugin(this._name,
                                            this._logFunction,
                                            this._errorCallback,
                                            this._monitorEventCallback,
                                            this._monitorInitializedCallback,
                                            config.monitor);

            this._log("info","Successfully registered MonitorPlugin: " + config.monitor.plugin);

        } catch(e) {
            var errMsg = this.__proto__.constructor.name+ "["+this._name+"] unexpected error creating MonitorPlugin: " + util.inspect(e);
            this._log('error',errMsg);
            throw new IoReactorException(errMsg,e);
        }

    }

    getName() {
        return this._name;
    }

    _monitorInitializedCallback() {
        this._log('info',"Monitor initialized OK");
    }

    _monitorEventCallback(eventType, fullPath, optionalFsStats, optionalExtraInfo) {
        this._log("trace", "Monitor event: " + eventType + " " + fullPath + " " + util.inspect(optionalFsStats) + " " + util.inspect(optionalExtraInfo));
    }

    /**
    *  Helper log function
    *  will set origin = this class' name
    */
    _log(severity,message) {
        if (this._logFunction) {
            this._logFunction(severity,(this.__proto__.constructor.name + '[' + this._name + ']'),message);

        } else {
            console.log(severity.toUpperCase() + " " + (this.__proto__.constructor.name + '[' + this._name + ']') + " " + message);
        }
    }

    /**
    *  Helper log function
    *  will set origin = this class' name
    */
    _onError(errorMessage, error) {
        if (this._errorCallback) {
            this._errorCallback(errorMessage, error);

        } else {
            this._log('warn','_onError() no errorCallback defined, throwing sourceError...');
            throw new IoReactorException(errorMessage,error);
        }
    }


}

module.exports = IoReactor;
