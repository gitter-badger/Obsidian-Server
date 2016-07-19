"use strict";
const Joi = require('joi');
const _ = require('lodash');
const Promise = require('bluebird');
const Constants = require('../config/constants');
const Logger = require('../app/logger');
let _adapters = [
    require('./adapters/postgresql'),
    require('./adapters/file')
];
function _loadConfig(environment, name, config) {
    return new Promise(function (resolve, reject) {
        Logger.info('Configuring adapter `' + name + '` with options', config);
        let promises = _.map(_adapters, function (A) {
            return new Promise(function (yep, nope) {
                try {
                    let adapter = new A(environment, name, config);
                    yep(adapter);
                }
                catch (err) {
                    nope(err);
                }
            });
        });
        Promise.any(promises).then(function (adapter) {
            Logger.info('Detected `' + adapter.adapterName + '` database for adapter `' + adapter.connectionName + '`', null, true);
            resolve(adapter);
        }).catch(reject);
    });
}
let _preValidationSchema = Joi.object({
    db: Joi.object().unknown().required()
}).unknown();
let _singleDBSchema = {
    type: Joi.string().required(),
    options: Joi.object().unknown().required()
};
function _generateSchema(keys) {
    var mapped = {};
    _.each(keys, function (key) {
        mapped[key] = Joi.object(_singleDBSchema).required();
    });
    _.each(_.keys(_singleDBSchema), function (key) {
        mapped[key] = Joi.any().forbidden();
    });
    let validationSchema = Joi.alternatives([
        Joi.object(_singleDBSchema).required(),
        Joi.object().keys(mapped)
    ]);
    return validationSchema;
}
function load(environment) {
    let validate = Promise.promisify(Joi.validate);
    return new Promise(function (resolve, reject) {
        validate(environment.config, _preValidationSchema).then(function (validated) {
            let dbConfig = validated['db'];
            let keys = _.keys(dbConfig);
            return validate(dbConfig, _generateSchema(keys));
        }).then(function (config) {
            let singleDB = _.isEmpty(_.difference(_.keys(config), _.keys(_singleDBSchema)));
            var dbConfigs = {};
            if (singleDB) {
                Logger.info('Detected single-database environment.');
                dbConfigs[Constants.defaultDBAdapterName] = config;
            }
            else {
                Logger.info('Detected multi-database environment.');
                dbConfigs = config;
            }
            let promises = _.map(dbConfigs, (options, key) => {
                return _loadConfig(environment, key, options);
            });
            Promise.all(promises).then(resolve, reject);
        }).catch(function (error) {
            Logger.error(null, 'Environment.json contains an invalid (or nonexistent) database configuration');
            reject(error);
        });
    });
}
exports.load = load;
//# sourceMappingURL=db.js.map