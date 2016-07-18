"use strict";
const Joi = require('joi');
const _ = require('lodash');
class Attribute {
    constructor(name, config) {
        this._name = name;
        let alternativeSchemas = _.map(Attribute.typeMap, function (value, key) {
            return Attribute.typeSchema(key);
        });
        let schema = Joi.alternatives(alternativeSchemas);
        let validationResult = Joi.validate(config, schema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        let validatedObject = validationResult.value;
        this._type = validatedObject['type'];
        this._defaultValue = validatedObject['default'];
        this._index = validatedObject['index'];
        this._unique = validatedObject['unique'];
    }
    static typeSchema(type) {
        return Joi.object({
            'type': Joi.string().valid(type).required(),
            'default': Joi.alternatives([
                Attribute.typeMap[type],
                Joi.func()
            ]).optional(),
            'index': Joi.boolean().valid(true).optional(),
            'unique': Joi.boolean().valid(true).optional()
        });
    }
    ;
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
    }
    get index() {
        return this._index;
    }
    get unique() {
        return this._unique;
    }
    get defaultValue() {
        return this._defaultValue;
    }
    get dbType() {
        return Attribute.dbTypeMap[this.type];
    }
}
Attribute.typeMap = {
    'integer': Joi.number().integer(),
    'float': Joi.number(),
    'string': Joi.string(),
    'boolean': Joi.boolean(),
    'date': Joi.date()
};
Attribute.dbTypeMap = {
    'integer': 'integer',
    'float': 'float',
    'string': 'string',
    'boolean': 'boolean',
    'date': 'datetime'
};
module.exports = Attribute;
//# sourceMappingURL=attribute.js.map