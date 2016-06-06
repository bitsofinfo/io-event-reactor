var util = require('util');

class EvaluatorUtil {
    constructor() {}

    /**
    * ioEventType() generate an Evaluator compliant function that will
    * return true for all `qualifyingIoEventTypes`
    *
    * @param qualifyingIoEventTypes one or more of add, addDir, unlink, unlinkDir, change
    */
    static ioEventType(qualifyingIoEventTypes) {
        return function(ioEvent) {
            return qualifyingIoEventTypes.indexOf(ioEvent.eventType) != -1;
        };
    }

    /**
    * regex() generate an Evaluator compliant function that will
    * return true for all matching `qualifyingIoEventTypes` AND where
    * fullPath also matches the given regex
    *
    * @param qualifyingIoEventTypes one or more of add, addDir, unlink, unlinkDir, change
    * @param fullPathRegex regular expression to be applied to the full paths
    * @param regexFlags
    */
    static regex(qualifyingIoEventTypes, fullPathRegex, regexFlags) {

        var parsedRegex = null;
        var typeEvaluator = EvaluatorUtil.ioEventType(qualifyingIoEventTypes);

        if (typeof(regexFlags) != 'undefined') {
            parsedRegex = new RegExp(fullPathRegex,regexFlags);
        } else {
            parsedRegex = new RegExp(fullPathRegex);
        }

        return function(ioEvent) {
            if (typeEvaluator(ioEvent)) {
                parsedRegex.lastIndex = 0;
                return parsedRegex.exec(ioEvent.fullPath);
            } else {
                return false;
            }
        };
    }

}

/**
* IoReactorException
* Class for wrapping exception
*/
class IoReactorException {

    /**
    * Constructor
    *
    * @param message error message
    * @param sourceError source error object
    */
    constructor(message,sourceError) {
        this.message = message;
        this.sourceError = sourceError;
    }
}



/**
* IoEvent class, encapsulates all information
* that makes up an IoEvent triggered by a MonitorPlugin
*
* ReactorPlugin's react() method will be passed objects of
* this specification
*
*/
class IoEvent {
    constructor(ioEventType, fullPath, optionalFsStats, optionalExtraInfo) {
        this._eventType = ioEventType;
        this._fullPath = fullPath;
        this._optionalFsStats = optionalFsStats;
        this._optionalExtraInfo = optionalExtraInfo;
    }
    get eventType() {
        return this._eventType;
    }
    get fullPath() {
        return this._fullPath;
    }
    get optionalFsStats() {
        return this._optionalFsStats;
    }
    get optionalExtraInfo() {
        return this._optionalExtraInfo;
    }
}


/**
* ReactorResult class, represents a result from the
* invocation of a ReactorPlugin's react() method
*
* ReactorPlugins must fulfill/reject with an object
* that meets this specification
*
*/
class ReactorResult {
    constructor(success, ioEvent, message, error) {
        this._ioEvent = ioEvent;
        this._success = success;
        this._message = message;
        this._error = error;
    }
    get isSuccess() {
        return this._success;
    }
    get message() {
        return this._message;
    }
    get ioEvent() {
        return this._ioEvent;
    }
    get error() {
        return this._error;
    }
}




class Evaluator {
    constructor(evaluatorFunction, reactors) {
        this._evaluatorFunction = evaluatorFunction;
        this._reactors = reactors;
    }

    evaluate(ioEventType, fullPath, optionalFsStats, optionalExtraInfo) {
        var x = this._evaluatorFunction(ioEventType, fullPath, optionalFsStats, optionalExtraInfo);
        return x;
    }

    getReactors() {
        return this._reactors;
    }
}



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
    *      evaluators - REQUIRED array[] of one or more config objects, each containing the following properties
    *           - evaluator: function(ioEventType, fullPath, optionalFsStats, optionalExtraInfo), if function returns 'true' all attached reactors will be invoked. If false, nothing will happen. See the 'Evaluators' class for methods that will generate an applicable function for simple use-cases.
    *           - reactors: array[] of reactor names that should be invoked if the 'evaluator' function returns 'true'
    *
    *      reactors - REQUIRED array[] of one of more reactor plugin configurations io-even-reactor "ReactorPlugin"'s' - see available list at: https://github.com/bitsofinfo/io-event-reactor
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
            var MonitorPlugin = require(config.monitor.plugin);

            var monitor = new MonitorPlugin(this._name,
                                            this._logFunction,
                                            this._errorCallback,
                                            this._monitorEventCallback.bind(this),
                                            this._monitorInitializedCallback,
                                            config.monitor);

            this._log("info","Successfully registered MonitorPlugin: " + config.monitor.plugin);

        } catch(e) {
            var errMsg = this.__proto__.constructor.name+ "["+this._name+"] unexpected error creating MonitorPlugin: " + util.inspect(e);
            this._log('error',errMsg);
            throw new IoReactorException(errMsg,e);
        }

        /**
        * #2 Build our Reactors
        */
        this._reactors = {};

        try {
            for (let reactorConf of config.reactors) {

                var ReactorPlugin = require(reactorConf.plugin);

                var reactor = new ReactorPlugin(this._name,
                                                this._logFunction,
                                                this._errorCallback,
                                                this._monitorInitializedCallback,
                                                reactorConf.config);

                this._reactors[reactor.getName()] = reactor;

                this._log("info","Successfully registered Reactor: " + reactor.getName());
            }


        } catch(e) {
            var errMsg = this.__proto__.constructor.name+ "["+this._name+"] unexpected error creating Reactors: " + util.inspect(e);
            this._log('error',errMsg);
            throw new IoReactorException(errMsg,e);
        }

        /**
        * #3 Build our evaluators and bind to reactors
        */
        this._evaluators = [];

        try {
            for (let evaluator of config.evaluators) {

                var boundReactors = [];
                for (let reactorName of evaluator.reactors) {
                    var reactorInstance = this._reactors[reactorName];
                    if (typeof(reactorInstance) == 'undefined') {
                        throw "No ReactorPlugin registered w/ name: " + reactorName;
                    }

                    console.log("PUSH " + reactorName);
                    boundReactors.push(reactorInstance);
                }

                this._evaluators.push(new Evaluator(evaluator.evaluator, boundReactors));
            }

            this._log("info","Successfully registered Evaluators: " + this._evaluators.length);

        } catch(e) {
            var errMsg = this.__proto__.constructor.name+ "["+this._name+"] unexpected error creating Evaluators: " + util.inspect(e);
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

        // create IoEvent
        var ioEvent = new IoEvent(eventType,fullPath,optionalFsStats,optionalExtraInfo);

        for (let evaluator of this._evaluators) {

            if (evaluator.evaluate(ioEvent)) {

                this._log('trace', "_monitorEventCallback(evaluator:passed) " + eventType + " " + fullPath);

                for (let reactor of evaluator.getReactors()) {

                    this._log('trace', "_monitorEventCallback() calling ReactorPlugin["+reactor.getName()+"].react() for: " + eventType + " " + fullPath);

                    reactor.react(ioEvent).then(function(result){
                        console.log(util.inspect(result));

                    }).catch(function(error) {
                        var errMsg = "ReactorPlugin["+reactor.getName()+"] had error reacting to event["+eventType+"] file["+fullPath+"]";
                        this._onError(errMsg,error);
                    });
                }
            } else {
                this._log('trace', "_monitorEventCallback(evaluator:did not pass) " + eventType + " " + fullPath);

            }
        }
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

module.exports.IoReactor = IoReactor;
module.exports.ReactorResult = ReactorResult;
module.exports.IoReactorException = IoReactorException;
module.exports.EvaluatorUtil = EvaluatorUtil;
