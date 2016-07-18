"use strict";
const Joi = require('joi');
const Constants = require('../../config/constants');
const ResourceMethod = require('./resource_method');
const Response = require('../responses/response');
const ErrorResponse = require('../responses/error_response');
class CreateMethod extends ResourceMethod {
    constructor(resource, descriptor, model) {
        super(resource, descriptor, model, Constants.HTTPVerb.POST);
    }
    validators() {
        let relationshipValidator = Joi.object({
            record: this.relationshipValidations
        });
        return super.validators().concat([CreateMethod.endpointValidator, relationshipValidator]);
    }
    handle(request, callback) {
        let self = this;
        let record = request.params['record'];
        this.model.create(record).then(function (record) {
            let response = new Response(self.resource.name, record, Constants.HTTPStatusCode.Created);
            callback(response);
        }).catch(function (error) {
            let response = new ErrorResponse(error);
            callback(response);
        });
    }
}
CreateMethod.endpointValidator = Joi.object({
    record: Joi.object().unknown().default({})
});
module.exports = CreateMethod;
//# sourceMappingURL=create_method.js.map