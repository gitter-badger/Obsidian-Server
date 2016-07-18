"use strict";
const _ = require('lodash');
const Promise = require('bluebird');
var Waterline = require('waterline');
const RelationshipType = require('../api/relationship_type');
const Model = require('./model');
const MigrationStrategy = require('./migration_strategy');
class ORM {
    constructor(resources, databases, strategy) {
        this._waterline = new Waterline();
        this._defaults = {
            migrate: 'safe'
        };
        switch (strategy) {
            case MigrationStrategy.Alter: {
                this._defaults.migrate = 'alter';
                break;
            }
            case MigrationStrategy.Create: {
                this._defaults.migrate = 'create';
                break;
            }
            case MigrationStrategy.Drop: {
                this._defaults.migrate = 'drop';
                break;
            }
        }
        this._config = this.generateConfig(databases);
        let models = this.generateModels(resources);
        _.each(models, function (model) {
            this._waterline.loadCollection(model);
        }, this);
    }
    generateConfig(databases) {
        let adapters = {};
        let connections = {};
        _.each(databases, function (adapter) {
            adapters[adapter.adapterName] = adapter.adapter;
            connections[adapter.connectionName] = _.extend({ adapter: adapter.adapterName }, adapter.options);
        });
        return {
            adapters: adapters,
            connections: connections,
            defaults: this._defaults
        };
    }
    generateModels(resources) {
        let models = _.map(resources, function (resource) {
            let resourceIdentity = resource.name.toLowerCase();
            let attributes = {};
            _.each(resource.attributes, function (attribute) {
                attributes[attribute.name] = {
                    type: attribute.dbType,
                    defaultsTo: attribute.defaultValue
                };
                if (attribute.index) {
                    attributes[attribute.name]['index'] = true;
                }
                if (attribute.unique) {
                    attributes[attribute.name]['unique'] = true;
                }
            });
            _.each(resource.relationships, function (relationship) {
                let targetResourceName = relationship.resourceName.toLowerCase();
                let association;
                switch (relationship.type) {
                    case RelationshipType.HasOne: {
                        association = {
                            model: targetResourceName
                        };
                        if (relationship.targetRelationshipName) {
                            association['via'] = relationship.targetRelationshipName;
                        }
                        break;
                    }
                    case RelationshipType.HasMany: {
                        association = {
                            collection: targetResourceName
                        };
                        if (relationship.targetRelationshipName) {
                            association['via'] = relationship.targetRelationshipName;
                        }
                        break;
                    }
                }
                attributes[relationship.name] = association;
            });
            let coll = Waterline.Collection.extend({
                identity: resourceIdentity,
                connection: resource.connection,
                attributes: attributes
            });
            return coll;
        });
        return models;
    }
    connect() {
        let self = this;
        let promise = new Promise(function (fulfill, reject) {
            self._waterline.initialize(self._config, function (err, result) {
                if (err)
                    reject(err);
                else {
                    self._models = _.mapValues(result.collections, function (collection, name) {
                        return new Model(name, collection);
                    });
                    fulfill(undefined);
                }
            });
        });
        return promise;
    }
    disconnect() {
        let self = this;
        return new Promise(function (fulfill, reject) {
            self._waterline.teardown(function (error) {
                if (error) {
                    reject(error);
                }
                else {
                    fulfill(undefined);
                }
            });
        });
    }
    get models() {
        return this._models;
    }
    model(name) {
        let key = name.toLowerCase();
        return this.models[key];
    }
}
module.exports = ORM;
//# sourceMappingURL=orm.js.map