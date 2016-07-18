"use strict";
const Moment = require('moment');
const Constants = require('../../config/constants');
const MappingHelpers = require('../../helpers/mapping_helpers');
function _decodeResponse(object) {
    return MappingHelpers.mapToJSON(object);
}
class Response {
    constructor(type, responseObject = null, statusCode = Constants.HTTPStatusCode.Ok) {
        this._responseObject = null;
        this._responseHeaders = {};
        this._statusCode = statusCode;
        this._type = type;
        this._responseObject = _decodeResponse(responseObject);
        this._date = Moment().toDate();
    }
    addResponseHeader(name, value) {
        this._responseHeaders[name] = value;
    }
    get statusCode() {
        return this._statusCode;
    }
    get type() {
        return this._type;
    }
    get responseObject() {
        return this._responseObject;
    }
    set responseObject(responseObject) {
        this._responseObject = _decodeResponse(responseObject);
    }
    get date() {
        return this._date;
    }
    get responseHeaders() {
        return this._responseHeaders;
    }
}
module.exports = Response;
//# sourceMappingURL=response.js.map