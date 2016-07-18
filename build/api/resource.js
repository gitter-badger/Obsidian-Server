"use strict";
const Joi = require('joi');
const _ = require('lodash');
const Constants = require('../config/constants');
const Attribute = require('./attribute');
const Relationship = require('./relationship');
const MethodDescriptor = require('./method_descriptor');
const ModuleLoader = require('../modules/module_loader');
class Resource {
    constructor(name, config, internal = false) {
        let self = this;
        this._name = name;
        this._internal = internal;
        let validationResult = Joi.validate(config, Resource.validationSchema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        let validatedObject = validationResult.value;
        this._db = validatedObject['db'];
        this._attributes = _.map(validatedObject['attributes'], function (object, key) {
            return new Attribute(key, object);
        });
        this._relationships = _.map(validatedObject['relationships'], function (object, key) {
            return new Relationship(key, object);
        });
        this._methodDescriptors = _.map(validatedObject['methods'], function (object, key) {
            return new MethodDescriptor(key, object);
        });
        this._modules = _.map(validatedObject['modules'], function (object, key) {
            let module = ModuleLoader.loadModule(key, object);
            _.each(module.customAttributes, function (attribute) {
                self._attributes.push(attribute);
            });
            return module;
        });
    }
    get connection() {
        return this._db;
    }
    get name() {
        return this._name;
    }
    get attributes() {
        return this._attributes;
    }
    get relationships() {
        return this._relationships;
    }
    get methodDescriptors() {
        return this._methodDescriptors;
    }
    get modules() {
        return this._modules;
    }
}
Resource.validationSchema = Joi.object({
    attributes: Joi.object().default({}),
    relationships: Joi.object().default({}),
    methods: Joi.object().default({}),
    modules: Joi.object().default({}),
    db: Joi.string().default(Constants.defaultDBAdapterName)
});
module.exports = Resource;
//# sourceMappingURL=resource.js.map