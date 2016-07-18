"use strict";
const Joi = require('joi');
const _ = require('lodash');
const FS = require('fs');
const Path = require('path');
const Constants = require('../config/constants');
const FilterLoader = require('../filters/filter_loader');
class MethodDescriptor {
    constructor(name, config) {
        let options = {
            name: name,
            config: config
        };
        let validationResult = Joi.validate(options, MethodDescriptor.validationSchema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        let validated = validationResult.value;
        let endpointName = validated['name'];
        this._name = endpointName;
        this._type = MethodDescriptor.builtInNames[endpointName];
        if (this._type == undefined) {
            this._type == Constants.MethodType.Custom;
        }
        let validatedConfig = validated['config'];
        if (_.isObject(validatedConfig)) {
            let filters = validatedConfig['filters'];
            if (_.isObject(filters)) {
                this._filters = _.map(filters, function (object, key) {
                    return FilterLoader.loadFilter(key, object);
                });
            }
            let implementationPath = validatedConfig['implementation'];
            if (implementationPath) {
                let joined = implementationPath[0] == '/' ? implementationPath : Path.join(process.cwd(), implementationPath);
                FS.accessSync(joined, FS.R_OK);
                this._modulePath = joined.substr(0, joined.lastIndexOf('.js'));
                this._type = Constants.MethodType.Custom;
                this._method = validatedConfig['method'];
            }
        }
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get filters() {
        return this._filters;
    }
    get modulePath() {
        return this._modulePath;
    }
    get method() {
        return this._method;
    }
}
MethodDescriptor.builtInNames = {
    create: Constants.MethodType.Create,
    read: Constants.MethodType.Read,
    update: Constants.MethodType.Update,
    destroy: Constants.MethodType.Destroy
};
MethodDescriptor.namesSchema = Joi.string().min(1).required();
MethodDescriptor.configSchema = Joi.alternatives([
    Joi.boolean().valid(true),
    Joi.object({
        implementation: Joi.string(),
        method: Joi.string().valid(_.values(Constants.HTTPVerb)),
        filters: Joi.object().default({}).unknown()
    }).with('implementation', 'method').with('method', 'implementation')
]);
MethodDescriptor.validationSchema = Joi.alternatives([
    Joi.object({
        name: MethodDescriptor.namesSchema,
        config: MethodDescriptor.configSchema
    })
]);
module.exports = MethodDescriptor;
//# sourceMappingURL=method_descriptor.js.map