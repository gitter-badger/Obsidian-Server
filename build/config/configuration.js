"use strict";
const Promise = require('bluebird');
const FS = require('fs');
class Configuration {
    constructor(path) {
        this._readFile = Promise.promisify(FS.readFile);
        this._parseJSON = Promise.promisify(function (buf, cb) {
            try {
                cb(null, JSON.parse(buf.toString()));
            }
            catch (e) {
                cb(e, null);
            }
        });
        this._validateJSON = Promise.promisify(this.runValidation);
        this._path = path;
    }
    load(callback) {
        this._readFile(this._path).then(this._parseJSON).then(this._validateJSON.bind(this)).then(function () {
            if (callback) {
                callback(null);
            }
        }).catch(function (error) {
            if (callback) {
                callback(error);
            }
        });
    }
    runValidation(json, callback) {
        try {
            this.validate(json);
            if (callback) {
                callback(null);
            }
        }
        catch (err) {
            if (callback) {
                callback(err);
            }
        }
    }
    validate(json) {
        this._validatedObject = json;
        return null;
    }
    get(key) {
        return this._validatedObject[key];
    }
}
module.exports = Configuration;
//# sourceMappingURL=configuration.js.map