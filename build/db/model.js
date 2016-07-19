"use strict";
const _ = require('lodash');
const Promise = require('bluebird');
const Logger = require('../app/logger');
const StringHelpers = require('../helpers/string_helpers');
class Model {
    constructor(name, collection) {
        this._name = name;
        this._collection = collection;
    }
    create(body) {
        let self = this;
        let creator = this._collection.create(body);
        let promise = new Promise(function (fulfill, reject) {
            self.log('create', body);
            creator.exec(function (err, record) {
                if (err)
                    reject(err);
                else
                    fulfill(record);
            });
        });
        return promise;
    }
    read(criteria = {}, sort = [], page = 0, limit = 1, include = []) {
        let self = this;
        let finder = this._collection.find();
        finder.where(criteria);
        _.each(sort, function (descriptor) {
            finder.sort(descriptor);
        });
        finder.paginate({
            page: page,
            limit: limit
        });
        _.each(include, function (key) {
            finder.populate(key);
        });
        let promise = new Promise(function (fulfill, reject) {
            finder.exec(function (err, records) {
                if (err)
                    reject(err);
                else
                    fulfill(records);
            });
        });
        return promise;
    }
    update(criteria, body) {
        let self = this;
        let updater = this._collection.update(criteria, body);
        let promise = new Promise(function (fulfill, reject) {
            updater.exec(function (err, records) {
                self.log('update', body);
                if (err)
                    reject(err);
                else
                    fulfill(records);
            });
        });
        return promise;
    }
    destroy(criteria) {
        let self = this;
        let destroyer = this._collection.destroy();
        destroyer.where(criteria);
        let promise = new Promise(function (fulfill, reject) {
            self.log('destroy', criteria);
            destroyer.exec(function (err, records) {
                if (err)
                    reject(err);
                else
                    fulfill(records);
            });
        });
        return promise;
    }
    log(operation, meta) {
        if (StringHelpers.startsWith(this.name, '_')) {
            return;
        }
        let message = operation + ' ' + this.name;
        Logger.db(message, meta);
    }
    get name() {
        return this._name;
    }
}
module.exports = Model;
//# sourceMappingURL=model.js.map