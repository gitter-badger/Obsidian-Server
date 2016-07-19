"use strict";
const _ = require('lodash');
const Constants = require('../config/constants');
function filterKeys(object, keys) {
    if (_.isArray(object)) {
        let self = this;
        return _.map(object, function (obj) {
            return self.filterKeys(obj, keys);
        });
    }
    else if (_.isObject(object)) {
        let result = _.omit(object, keys);
        return result;
    }
    else {
        return object;
    }
}
exports.filterKeys = filterKeys;
function filterQueryStringNulls(object) {
    if (_.isArray(object)) {
        let self = this;
        return _.map(object, function (obj) {
            return self.filterQueryStringNulls(obj);
        });
    }
    else if (_.isObject(object)) {
        let self = this;
        return _.mapValues(object, function (obj) {
            return self.filterQueryStringNulls(obj);
        });
    }
    else if (_.isString(object)) {
        return object == Constants.MagicNullString ? null : object;
    }
    else {
        return object;
    }
}
exports.filterQueryStringNulls = filterQueryStringNulls;
function mapToJSON(object) {
    if (_.isArray(object)) {
        let self = this;
        return _.map(object, o => {
            return self.mapToJSON(o);
        });
    }
    else if (_.isFunction(object.toJSON)) {
        return object.toJSON();
    }
    else {
        return object;
    }
}
exports.mapToJSON = mapToJSON;
//# sourceMappingURL=mapping_helpers.js.map