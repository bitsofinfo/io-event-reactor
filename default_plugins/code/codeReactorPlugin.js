'use strict'

var util = require('util');
var ReactorResult = require('io-event-reactor-plugin-support').ReactorResult;


class CodeReactorPlugin {

    /**
    * Constructor
    *
    * An io-event-reactor ReactorPlugin that just invokes the a provided function
    *
    * @param pluginId - identifier for this plugin
    * @param reactorId - id of the IoReactor this Monitor plugin is bound to
    * @param logFunction - a function to be used for logging w/ signature function(severity, origin, message)
    * @param initializedCallback - when this ReactorPlugin is full initialized, this callback function(reactorPluginId) should be invoked
    *
    * @param pluginConfig - Configuration object containing one
    *                       property named 'codeFunction' with the signature function(ioEvent) that should return a promise
    *                       whatever is returned on fulfillment will be attached to the ReactorResult context under a property
    *                       called '[pluginId]_reactor_result'
    *
    */
    constructor(pluginId,
                reactorId,
                logFunction,
                errorCallback,
                initializedCallback,
                pluginConfig) {

        try {
            this._pluginId = pluginId;
            this._reactorId = reactorId;
            this._logFunction = logFunction;
            this._errorCallback = errorCallback;
            this._initializedCallback = initializedCallback;
            this._codeFunction = pluginConfig.codeFunction;

            this._initializedCallback(this.getId());

        } catch(e) {
            var errMsg = this.__proto__.constructor.name +"["+this._reactorId+"] unexpected error: " + e;
            this._log('error',errMsg);
            this._onError(errMsg,e);
        }

    }

    /**
    * getId() - core ReactorPlugin function
    *
    * @return the short name used to bind this reactor plugin to an Evaluator
    */
    getId() {
        return this._pluginId;
    }

    /**
    * react() - core ReactorPlugin function
    *
    * This function is required on ReactorPlugin implementations
    *
    * @param ioEvent - IoEvent object to react to
    * @return Promise - when fulfilled/rejected a ReactorResult object, on error the ReactorResult will contain the error
    *
    */
    react(ioEvent) {
        var self = this;

        return new Promise(function(resolve, reject) {
            try {
                self._log('info',"react["+self.getId()+"]() invoked: " + ioEvent.eventType + " for: " + ioEvent.fullPath);

                // exec the codeFunction()
                self._codeFunction(ioEvent).then(function(result) {

                    // bag the result onto the ioevent context
                    ioEvent.context[self.getId() + '_reactor_result'] = result;
                    resolve(new ReactorResult(true,self.getId(),self._reactorId,ioEvent,"CodeReactorPlugin["+self.getId()+"] executed OK with result: " + result));

                }).catch(function(error) {

                    reject(new ReactorResult(false,self.getId(),self._reactorId,ioEvent,"Error executing codeFunction: " + error, error))

                });

            } catch(e) {
                reject(new ReactorResult(false,self.getId(),self._reactorId,ioEvent,"Error executing codeFunction: " + error, error));
            }
        });
    }

    /**
    *  Helper log function
    *  will set origin = this class' name
    */
    _log(severity,message) {
        this._logFunction(severity,(this.__proto__.constructor.name + '[' + this._reactorId + ']['+this.getId()+']'),message);
    }

    /**
    *  Helper error function
    */
    _onError(errorMessage, error) {
        this._errorCallback(errorMessage, error);
    }

}

module.exports = CodeReactorPlugin;
