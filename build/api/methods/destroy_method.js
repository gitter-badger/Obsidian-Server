"use strict";
const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const Constants = require('../../config/constants');
const ResourceMethod = require('./resource_method');
const Response = require('../responses/response');
const ErrorResponse = require('../responses/error_response');
class DestroyMethod extends ResourceMethod {
    constructor(resource, descriptor, model) {
        super(resource, descriptor, model, Constants.HTTPVerb.DELETE);
    }
    validators() {
        return super.validators().concat([DestroyMethod.endpointValidator]);
    }
    handle(request, callback) {
        let self = this;
        let criteria = request.params['criteria'];
        this.model.destroy(criteria).then(function (records) {
            if (_.isEmpty(records)) {
                let errorMessage = 'No records were found matching your criteria';
                let notFound = Boom.notFound(errorMessage);
                let errorResponse = new ErrorResponse(notFound);
                callback(errorResponse);
            }
            else {
                let response = new Response(self.resource.name, records);
                callback(response);
            }
        }).catch(function (error) {
            let errorResponse = new ErrorResponse(error);
            callback(errorResponse);
        });
    }
}
DestroyMethod.endpointValidator = Joi.object({
    criteria: Joi.object().min(1).unknown().required()
});
module.exports = DestroyMethod;
//# sourceMappingURL=destroy_method.js.map