"use strict";
const Joi = require('joi');
const _ = require('lodash');
const Logger = require('../app/logger');
const Configuration = require('./configuration');
const Metadata = require('../api/metadata');
const Resource = require('../api/resource');
let _semverRegex = require('semver-regex')();
class Resources extends Configuration {
    constructor(...args) {
        super(...args);
        this._resources = [];
    }
    validate(json) {
        let result = Joi.validate(json, Resources.validationSchema);
        let error = result.error || super.validate(result.value);
        if (error) {
            throw error;
        }
        let validated = result.value;
        this._metadata = new Metadata(validated['metadata']['name'], validated['metadata']['version']);
        Logger.info('Loaded service metadata (`' + this.metadata.name + '` version ' + this.metadata.version + ')', null, true);
        let resourceDicts = validated['resources'];
        let resources = _.map(resourceDicts, function (value, key) {
            let resource = new Resource(key, value);
            Logger.info('Loaded resource `' + key + '`', null, true);
            return resource;
        });
        let self = this;
        _.each(resources, resource => {
            self.addResource(resource);
        });
    }
    get metadata() {
        return this._metadata;
    }
    get resources() {
        return this._resources;
    }
    addResource(resource) {
        if (this._resources) {
            this._resources.push(resource);
        }
        else {
            this._resources = [resource];
        }
    }
}
Resources.validationSchema = Joi.object({
    metadata: Joi.object().required().keys({
        name: Joi.string().required(),
        version: Joi.string().regex(_semverRegex).required()
    }),
    resources: Joi.object().required()
}).unknown(true);
module.exports = Resources;
//# sourceMappingURL=resources.js.map