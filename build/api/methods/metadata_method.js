"use strict";
const Constants = require('../../config/constants');
const Method = require('./method');
const Response = require('../responses/response');
class MetadataMethod extends Method {
    constructor(metadata) {
        super(Constants.HTTPVerb.GET, Constants.BuiltInResource.metadata);
        this._metadata = metadata;
    }
    handle(request, callback) {
        let data = {
            name: this._metadata.name,
            version: this._metadata.version
        };
        let response = new Response('metadata', data);
        callback(response);
    }
}
module.exports = MetadataMethod;
//# sourceMappingURL=metadata_method.js.map