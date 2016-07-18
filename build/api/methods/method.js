"use strict";
const Promise = require('bluebird');
const Boom = require('boom');
const ErrorResponse = require('../responses/error_response');
class Method {
    constructor(verb, name) {
        this._verb = verb;
        this._name = name;
    }
    validators() {
        return [];
    }
    handle(request, callback) {
        let response = new ErrorResponse(Boom.notFound());
        callback(response);
    }
    transformRequest(request) {
        return new Promise(function (fulfill, reject) {
            fulfill(request);
        });
    }
    transformResponse(response) {
        return new Promise(function (fulfill, reject) {
            fulfill(response);
        });
    }
    get verb() {
        return this._verb;
    }
    get name() {
        return this._name;
    }
    get filters() {
        return this._filters;
    }
    set filters(filters) {
        this._filters = filters;
    }
}
module.exports = Method;
//# sourceMappingURL=method.js.map