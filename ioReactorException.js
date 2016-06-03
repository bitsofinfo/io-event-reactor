

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


module.exports = IoReactorException;
