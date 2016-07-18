"use strict";
const _ = require('lodash');
const Joi = require('joi');
const Constants = require('../../config/constants');
const MappingHelpers = require('../../helpers/mapping_helpers');
const ResourceMethod = require('./resource_method');
const Response = require('../responses/response');
const ErrorResponse = require('../responses/error_response');
class ReadMethod extends ResourceMethod {
    constructor(resource, descriptor, model) {
        super(resource, descriptor, model, Constants.HTTPVerb.GET);
    }
    validators() {
        return super.validators().concat([ReadMethod.endpointValidator]);
    }
    handle(request, callback) {
        let self = this;
        let sortKeys = [];
        let sortList = request.params['sort'];
        if (!_.isEmpty(sortList)) {
            let sortComponents = sortList.split(',');
            let trimmedComponents = _.map(sortComponents, function (component) { return _.trim(component); });
            sortKeys = trimmedComponents;
        }
        let criteria = MappingHelpers.filterQueryStringNulls(request.params['criteria']);
        let pagination = request.params['pagination'];
        let include = request.params['include'];
        this.model.read(criteria, sortKeys, pagination.page, pagination.limit, include).then(function (records) {
            let response = new Response(self.resource.name, records || []);
            callback(response);
        }).catch(function (error) {
            let errorResponse = new ErrorResponse(error);
            callback(errorResponse);
        });
    }
}
ReadMethod.endpointValidator = Joi.object({
    criteria: Joi.object().unknown().default({}),
    sort: Joi.string().optional().default(null),
    include: Joi.array().items(Joi.string().min(1)).optional(),
    pagination: Joi.object({
        page: Joi.number().integer().min(1).required(),
        limit: Joi.number().integer().min(1).required()
    }).default({
        page: 0,
        limit: 1
    })
});
module.exports = ReadMethod;
//# sourceMappingURL=read_method.js.map