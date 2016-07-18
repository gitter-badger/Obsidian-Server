"use strict";
const Promise = require('bluebird');
class Module {
    constructor(customAttributes) {
        this._customAttributes = customAttributes;
    }
    get customAttributes() {
        return this._customAttributes;
    }
    transformRequest(request) {
        return new Promise(function (fulfill, reject) {
            fulfill(request);
        });
    }
    transformResponse(response) {
        return new Promise(function (fulfill, reject) {
            fulfill(response);
        });
    }
    generateMethods(model, resource) {
        return [];
    }
}
module.exports = Module;
//# sourceMappingURL=module.js.map