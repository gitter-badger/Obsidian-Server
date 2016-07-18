"use strict";
const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const Constants = require('../../config/constants');
const ResourceMethod = require('./resource_method');
const Response = require('../responses/response');
const ErrorResponse = require('../responses/error_response');
class UpdateMethod extends ResourceMethod {
    constructor(resource, descriptor, model) {
        super(resource, descriptor, model, Constants.HTTPVerb.PATCH);
    }
    validators() {
        let relationshipValidator = Joi.object({
            record: this.relationshipValidations
        });
        return super.validators().concat([UpdateMethod.endpointValidator, relationshipValidator]);
    }
    handle(request, callback) {
        let self = this;
        let record = request.params['record'];
        let criteria = request.params['criteria'];
        this.model.update(criteria, record).then(function (records) {
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
UpdateMethod.endpointValidator = Joi.object({
    record: Joi.object({
        id: Joi.any().forbidden()
    }).min(1).unknown().required(),
    criteria: Joi.object().min(1).unknown().required()
});
module.exports = UpdateMethod;
//# sourceMappingURL=update_method.js.map