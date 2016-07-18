"use strict";
const _ = require('lodash');
const ResourceMethod = require('./resource_method');
const Response = require('../responses/response');
const ErrorResponse = require('../responses/error_response');
class CustomMethod extends ResourceMethod {
    constructor(resource, descriptor, model, models, config, verb, modulePath) {
        super(resource, descriptor, model, verb);
        this._models = models;
        this._config = config;
        this._implementation = require(modulePath);
        if (!_.isFunction(this._implementation)) {
            let errorString = "Module at " + modulePath + " must export a single function.  For more details, visit https://engine.tendigi.com/";
            throw new Error(errorString);
        }
    }
    handle(request, callback) {
        let self = this;
        let info = {
            models: this._models,
            config: this._config
        };
        this._implementation(request, info, function (error, object) {
            if (error) {
                let response = new ErrorResponse(error);
                callback(response);
            }
            else {
                let responseArray = [];
                if (_.isArray(object)) {
                    responseArray = object;
                }
                else if (object) {
                    responseArray.push(object);
                }
                let response = new Response(self.resource.name, responseArray);
                callback(response);
            }
        });
    }
}
module.exports = CustomMethod;
//# sourceMappingURL=custom_method.js.map