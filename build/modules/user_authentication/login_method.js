"use strict";
const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const BCrypt = require('bcrypt');
const Constants = require('../../config/constants');
const ResourceMethod = require('../../api/methods/resource_method');
const Response = require('../../api/responses/response');
const ErrorResponse = require('../../api/responses/error_response');
const UserAuthenticationAttributes = require('./user_authentication_attributes');
let _validations = {};
_validations[UserAuthenticationAttributes.emailAttribute.name] = Joi.string().email();
_validations[UserAuthenticationAttributes.usernameAttribute.name] = Joi.string().min(1);
_validations[UserAuthenticationAttributes.passwordAttribute.name] = Joi.string().min(1).required();
let _criteriaValidation = Joi.object(_validations).unknown().or([UserAuthenticationAttributes.emailAttribute.name, UserAuthenticationAttributes.usernameAttribute.name]);
class LoginMethod extends ResourceMethod {
    constructor(resource, descriptor, model) {
        super(resource, descriptor, model, Constants.HTTPVerb.POST);
    }
    validators() {
        return super.validators().concat([LoginMethod.validationSchema]);
    }
    handle(request, callback) {
        let self = this;
        let criteria = request.params['criteria'];
        let orCriteria = [];
        if (criteria[UserAuthenticationAttributes.emailAttribute.name]) {
            let match = {};
            match[UserAuthenticationAttributes.emailAttribute.name] = criteria[UserAuthenticationAttributes.emailAttribute.name];
            orCriteria.push(match);
        }
        if (criteria[UserAuthenticationAttributes.usernameAttribute.name]) {
            let match = {};
            match[UserAuthenticationAttributes.usernameAttribute.name] = criteria[UserAuthenticationAttributes.usernameAttribute.name];
            orCriteria.push(match);
        }
        let password = criteria[UserAuthenticationAttributes.passwordAttribute.name];
        this.model.read({
            or: orCriteria
        }, null, 1, 1).then(function (records) {
            if (_.isEmpty(records)) {
                let error = Boom.unauthorized();
                let errorResponse = new ErrorResponse(error);
                callback(errorResponse);
                return;
            }
            let user = records[0];
            let hash = user[UserAuthenticationAttributes.passwordAttribute.name];
            BCrypt.compare(password, hash, function (err, same) {
                if (err || !same) {
                    let error = Boom.unauthorized();
                    let errorResponse = new ErrorResponse(error);
                    callback(errorResponse);
                }
                else {
                    let response = new Response(self.resource.name, records);
                    let token = user[UserAuthenticationAttributes.tokenAttribute.name];
                    response.addResponseHeader(Constants.AuthHeaders.bearerToken, token);
                    callback(response);
                }
            });
        }).catch(function (error) {
            let errorResponse = new ErrorResponse(error);
            callback(errorResponse);
        });
    }
}
LoginMethod.validationSchema = Joi.object({
    criteria: _criteriaValidation.required()
});
module.exports = LoginMethod;
//# sourceMappingURL=login_method.js.map