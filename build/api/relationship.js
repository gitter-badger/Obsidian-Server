"use strict";
const _ = require('lodash');
const Joi = require('joi');
const RelationshipType = require('./relationship_type');
class Relationship {
    constructor(name, config) {
        this._name = name;
        let validationResult = Joi.validate(config, Relationship.validationSchema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        let validated = validationResult.value;
        this._type = Relationship.typeMap[validated['type']];
        this._resourceName = validated['resource'];
        this._targetRelationshipName = validated['target_relationship'];
    }
    get name() {
        return this._name;
    }
    get resourceName() {
        return this._resourceName;
    }
    get type() {
        return this._type;
    }
    get targetRelationshipName() {
        return this._targetRelationshipName;
    }
}
Relationship.typeMap = {
    has_one: RelationshipType.HasOne,
    has_many: RelationshipType.HasMany
};
Relationship.validationSchema = Joi.object({
    resource: Joi.string().min(1).alphanum().required(),
    type: Joi.string().valid(_.keys(Relationship.typeMap)).required(),
    target_relationship: Joi.string().min(1).alphanum().optional()
});
module.exports = Relationship;
//# sourceMappingURL=relationship.js.map