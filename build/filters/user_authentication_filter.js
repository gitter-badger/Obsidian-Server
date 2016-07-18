"use strict";
const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const Promise = require('bluebird');
const Constants = require('../config/constants');
const Filter = require('./filter');
const UserAuthenticationAttributes = require('../modules/user_authentication/user_authentication_attributes');
let _filterName = 'user_authentication';
class UserAuthenticationFilter extends Filter {
    constructor(options) {
        let validationResult = Joi.validate(options, UserAuthenticationFilter.validationSchema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        super();
        let validated = validationResult.value;
        this._resourceName = validated['resource'];
        this._matchAttribute = validated['match_attribute'];
    }
    before(request) {
        let self = this;
        return super.before(request).then(function () {
            return self.authenticateUser(request);
        });
    }
    authenticateUser(request) {
        let self = this;
        return new Promise(function (fulfill, reject) {
            let bearerToken = request.headers[Constants.AuthHeaders.bearerToken];
            if (_.isEmpty(bearerToken)) {
                let error = Boom.unauthorized();
                reject(error);
                return;
            }
            let criteria = {};
            criteria[UserAuthenticationAttributes.tokenAttribute.name] = bearerToken;
            let model = self.orm.model(self._resourceName);
            model.read(criteria, null, 1, 1).then(function (records) {
                if (_.isEmpty(records)) {
                    let error = Boom.unauthorized();
                    reject(error);
                }
                else {
                    let authenticatedUser = records[0];
                    if (self._matchAttribute) {
                        let idValidation = {};
                        idValidation[self._matchAttribute] = Joi.any().valid(authenticatedUser['id']).required();
                        let validationSchema = Joi.object({
                            criteria: Joi.object(idValidation).unknown()
                        }).unknown();
                        let validationResult = Joi.validate(request.params, validationSchema);
                        if (validationResult.error) {
                            let error = Boom.unauthorized();
                            reject(error);
                        }
                        else {
                            fulfill(undefined);
                        }
                    }
                    else {
                        fulfill(undefined);
                    }
                }
            });
        });
    }
}
UserAuthenticationFilter.filterName = _filterName;
UserAuthenticationFilter.validationSchema = Joi.object({
    resource: Joi.string().min(1).required(),
    match_attribute: Joi.string().min(1).optional()
});
module.exports = UserAuthenticationFilter;
//# sourceMappingURL=user_authentication_filter.js.map