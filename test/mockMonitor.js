'use strict'

var util = require('util');

class MockMonitorPlugin {

    constructor(reactorId,
                logFunction,
                errorCallback,
                ioEventCallback,
                initializedCallback,
                pluginConfig) {

        try {
            this._reactorId = reactorId;
            this._logFunction = logFunction;
            this._errorCallback = errorCallback;
            this._ioEventCallback = ioEventCallback;
            this._initializedCallback = initializedCallback;

            this._initializedCallback();

            console.log(pluginConfig);

            // For each monitorTrigger config
            for (let monitorTrigger of pluginConfig.monitorTriggers) {

                // set a timeout to call the trigger to get the ioEvent
                // and then call the ioEventCallback with the contents
                // of the generated event.
                setTimeout(function() {
                                var ioEvent = monitorTrigger.eventGenerator();
                                ioEventCallback(ioEvent.eventType,ioEvent.fullPath,ioEvent.optionalFsStats,ioEvent.optionalExtraInfo);
                           }, monitorTrigger.timeout);
            }

        } catch(e) {
            var errMsg = this.__proto__.constructor.name +"["+this._reactorId+"] unexpected error: " + e;
            this._log('error',errMsg);
            this._onError(errMsg,e);
        }

    }

    _log(severity,message) {
        //console.log(severity + ' ' + message);
        this._logFunction(severity,(this.__proto__.constructor.name + '[' + this._reactorId + ']'),message);
    }

    /**
    *  Helper error function
    */
    _onError(errorMessage, error) {
        this._errorCallback(errorMessage, error);
    }

}


module.exports = MockMonitorPlugin;
