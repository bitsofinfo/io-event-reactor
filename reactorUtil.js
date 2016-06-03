class ReactorResult {
    constructor(success, ioEventType, fullPath, optionalFsStats, optionalExtraInfo, message) {
        this._ioEventType = ioEventType;
        this._fullPath = fullPath;
        this._optionalFsStats = optionalFsStats;
        this._optionalExtraInfo = optionalExtraInfo;
        this._success = success;
        this._message = message;
    }
    isSuccess() {
        return this._success;
    }
    getMessage() {
        return this._message;
    }
}

module.exports = ReactorResult;
