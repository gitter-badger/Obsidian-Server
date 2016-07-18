"use strict";
const _ = require('lodash');
const Promise = require('bluebird');
const Constants = require('../config/constants');
const Resource = require('./resource');
class Authenticator {
    constructor() {
        this._resource = new Resource(Constants.BuiltInResource.client, Authenticator.resourceConfig, true);
    }
    authenticate(key, secret) {
        let self = this;
        return new Promise(function (fulfill, reject) {
            if (_.isEmpty(key) || _.isEmpty(secret)) {
                fulfill(false);
            }
            else if (self.orm) {
                let Client = self.model;
                if (Client) {
                    let criteria = {
                        key: key,
                        secret: secret
                    };
                    Client.read(criteria, null, null, 1).then(function (records) {
                        fulfill(!_.isEmpty(records));
                    }).catch(reject);
                }
                else {
                    let error = new Error('Authenticator error: Client model not found on ORM.');
                    reject(error);
                }
            }
            else {
                let error = new Error('Authenticator error: ORM not set.');
                reject(error);
            }
        });
    }
    createClient(name, key, secret) {
        return this.model.create({
            name: name,
            key: key,
            secret: secret
        });
    }
    listClients() {
        return this.model.read({}, null, null, 0);
    }
    deleteClient(key) {
        let self = this;
        return new Promise(function (fulfill, reject) {
            self.model.destroy({
                key: key
            }).then(function (deleted) {
                fulfill(!_.isEmpty(deleted));
            }).catch(reject);
        });
    }
    get resource() {
        return this._resource;
    }
    get orm() {
        return this._orm;
    }
    set orm(orm) {
        this._orm = orm;
    }
    get model() {
        return this.orm.model(Constants.BuiltInResource.client);
    }
}
Authenticator.resourceConfig = {
    attributes: {
        name: {
            type: "string"
        },
        key: {
            type: "string",
            index: true
        },
        secret: {
            type: "string",
            index: true
        }
    }
};
module.exports = Authenticator;
//# sourceMappingURL=authenticator.js.map