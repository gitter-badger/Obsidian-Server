"use strict";
const _ = require('lodash');
const Joi = require('joi');
const Method = require('./method');
class ResourceMethod extends Method {
    constructor(resource, descriptor, model, verb) {
        super(verb, descriptor.name);
        this._resource = resource;
        this._descriptor = descriptor;
        this._model = model;
    }
    transformRequest(request) {
        let superPromise = super.transformRequest(request);
        return _.reduce(this.resource.modules, function (p, m) {
            return p.then(function (req) {
                return m.transformRequest(req);
            });
        }, superPromise);
    }
    transformResponse(response) {
        let superPromise = super.transformResponse(response);
        return _.reduce(this.resource.modules, function (p, m) {
            return p.then(function (res) {
                return m.transformResponse(res);
            });
        }, superPromise);
    }
    get resource() {
        return this._resource;
    }
    get descriptor() {
        return this._descriptor;
    }
    get model() {
        return this._model;
    }
    get relationshipValidations() {
        let validations = {};
        _.each(this.resource.relationships, function (relationship) {
            validations[relationship.name] = ResourceMethod.idValidator;
        });
        return Joi.object(validations).unknown();
    }
}
ResourceMethod.idValidator = Joi.alternatives([
    Joi.string().min(1),
    Joi.number().integer().min(0),
    Joi.any().valid(null)
]);
module.exports = ResourceMethod;
//# sourceMappingURL=resource_method.js.map