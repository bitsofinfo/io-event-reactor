var util = require('util');

class EvaluatorUtil {
    constructor() {}

    static ioEventType(qualifyingIoEventTypes) {
        return function(ioEventType, fullPath, optionalFsStats, optionalExtraInfo) {
            return qualifyingIoEventTypes.indexOf(ioEventType) != -1;
        };
    }

    static regex(qualifyingIoEventTypes, fullPathRegex, regexFlags) {

        var parsedRegex = null;
        var typeEvaluator = EvaluatorUtil.ioEventType(qualifyingIoEventTypes);

        if (typeof(regexFlags) != 'undefined') {
            parsedRegex = new RegExp(fullPathRegex,regexFlags);
        } else {
            parsedRegex = new RegExp(fullPathRegex);
        }

        return function(ioEventType, fullPath, optionalFsStats, optionalExtraInfo) {
            if (typeEvaluator(ioEventType,fullPath,optionalFsStats,optionalExtraInfo)) {
                parsedRegex.lastIndex = 0;
                return parsedRegex.exec(fullPath);
            } else {
                return false;
            }
        };
    }

}

module.exports = EvaluatorUtil;
