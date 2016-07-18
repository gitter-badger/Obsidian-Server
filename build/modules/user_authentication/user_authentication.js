"use strict";
const _ = require('lodash');
const Joi = require('joi');
const BCrypt = require('bcrypt');
const Promise = require('bluebird');
const MappingHelpers = require('../../helpers/mapping_helpers');
const Module = require('../module');
const StringHelpers = require('../../helpers/string_helpers');
const MethodDescriptor = require('../../api/method_descriptor');
const LoginMethod = require('./login_method');
const UserAuthenticationAttributes = require('./user_authentication_attributes');
let _attributes = [
    UserAuthenticationAttributes.tokenAttribute,
    UserAuthenticationAttributes.passwordAttribute
];
class UserAuthentication extends Module {
    constructor(options) {
        let validationResult = Joi.validate(options, UserAuthentication.validationSchema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        let validated = validationResult.value;
        let attributes = _.clone(_attributes);
        if (validated['email']) {
            attributes.push(UserAuthenticationAttributes.emailAttribute);
        }
        if (validated['username']) {
            attributes.push(UserAuthenticationAttributes.usernameAttribute);
        }
        super(attributes);
        this._filteredKeys = _.map(_attributes, function (attribute) {
            return attribute.name;
        });
    }
    genSalt() {
        return new Promise(function (resolve, reject) {
            BCrypt.genSalt(function (err, salt) {
                if (err)
                    reject(err);
                else
                    resolve(salt);
            });
        });
    }
    hashPassword(salt, password) {
        return new Promise(function (resolve, reject) {
            BCrypt.hash(password, salt, function (err, hashed) {
                if (err)
                    reject(err);
                else
                    resolve(hashed);
            });
        });
    }
    generateHash(password) {
        let self = this;
        return this.genSalt().then(function (salt) {
            return self.hashPassword(salt, password);
        });
    }
    transformRequest(request) {
        return super.transformRequest(request).bind(this).then(this.hashAndDelete);
    }
    transformResponse(response) {
        let self = this;
        return new Promise(function (fulfill, reject) {
            let modifiedResponseObject = MappingHelpers.filterKeys(response.responseObject, self._filteredKeys);
            response.responseObject = modifiedResponseObject;
            fulfill(response);
        });
    }
    hashAndDelete(request) {
        let self = this;
        return new Promise(function (fulfill, reject) {
            let params = request.params;
            let record = request.params['record'];
            if (record) {
                delete record[UserAuthenticationAttributes.tokenAttribute.name];
                let inputPassword = record[UserAuthenticationAttributes.passwordAttribute.name];
                if (inputPassword) {
                    self.generateHash(inputPassword).then(function (hashed) {
                        record[UserAuthenticationAttributes.passwordAttribute.name] = hashed;
                        params['record'] = record;
                        request.params = params;
                        fulfill(request);
                    }).catch(reject);
                }
                else {
                    params['record'] = record;
                    request.params = params;
                    fulfill(request);
                }
            }
            else {
                request.params = params;
                fulfill(request);
            }
        });
    }
    generateMethods(model, resource) {
        let methods = [];
        let loginMethodName = StringHelpers.prefixKey(UserAuthenticationAttributes.moduleName, 'login');
        let loginMethodDescriptor = new MethodDescriptor(loginMethodName, true);
        let loginMethod = new LoginMethod(resource, loginMethodDescriptor, model);
        methods.push(loginMethod);
        return super.generateMethods(model, resource).concat(methods);
    }
}
UserAuthentication.moduleName = UserAuthenticationAttributes.moduleName;
UserAuthentication.validationSchema = Joi.object({
    email: Joi.boolean().valid(true),
    username: Joi.boolean().valid(true)
}).or(['email', 'username']);
module.exports = UserAuthentication;
//# sourceMappingURL=user_authentication.js.map