'use strict'

var IoReactor = require('./ioReactor').IoReactor;
var IoReactorException = require('./ioReactor').IoReactorException;
var util = require('util');


/**
*
* IoReactorService is the root level entry point for using
* the io-event-reactor module. A single instance is all that is
* needed to manage one or more live IoReactor instances each with
* their own MonitorPlugin, and one or more ReactorPlugins
*
*/
class IoReactorService {

    /**
     * IoReactorService constructor
     *
     * @param config - takes the following configuration object
     *
     *  logFunction - OPTIONAL default logger function(severity, origin, message) that will be called for logging, unless overridden by a specific reactor's logFunction. If not provided will default to console.log
     *
     *  errorCallback - OPTIONAL default error handler function(message, sourceErrorObject) that will be called on any error, unless overridden by a specific reactor's errorCallback. If not provided IoReactor will throw an IoReactorException
     *
     *  ioReactors - REQUIRED array of one or more ioReactor config objects as defined in ioReactor.js
     *
     *
    **/
    constructor(config) {

        // capture our log function reference
        // and error handler callback
        this._logFunction = config.logFunction; // function(severity, origin, message)
        this._errorCallback = config.errorCallback; // function(message, sourceErrorObject)

        this.ioReactors = [];

        for (let ioReactorConfig of config.ioReactors) {

            try {
                // if no logFunction or errorCallback provided
                // set it equal to the service's configured functions
                if (!ioReactorConfig.logFunction) {
                    ioReactorConfig.logFunction = this._logFunction;
                }
                if (!ioReactorConfig.errorCallback) {
                    ioReactorConfig.errorCallback = this._errorCallback;
                }

                var ioReactor = new IoReactor(ioReactorConfig);
                this.ioReactors.push(ioReactor);
                this._log("info", "Registered IoReactor["+ioReactorConfig.id+"]");

            } catch(e) {
                var errMsg = this.__proto__.constructor.name + ' Unexpected error registering IoReactor config: ' + config + " error:" + util.inspect(e);
                this._log('error',errMsg);
                this._onError(errMsg,e);
            }
        }


    }

    /**
    *  Helper log function
    *  will set origin = this class' name
    */
    _log(severity,message) {
        if (this._logFunction) {
            this._logFunction(severity,(this.__proto__.constructor.name),message);

        } else {
            console.log(severity.toUpperCase() + " " + origin + " " + msg);
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


module.exports = IoReactorService;
