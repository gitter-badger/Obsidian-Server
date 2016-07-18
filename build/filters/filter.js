"use strict";
const Promise = require('bluebird');
class Filter {
    before(request) {
        return new Promise(function (fulfill, reject) {
            fulfill(undefined);
        });
    }
    after(request) {
        return new Promise(function (fulfill, reject) {
            fulfill(undefined);
        });
    }
    get orm() {
        return this._orm;
    }
    set orm(orm) {
        this._orm = orm;
    }
}
module.exports = Filter;
//# sourceMappingURL=filter.js.map