"use strict";
const Joi = require('joi');
const Constants = require('../../config/constants');
const Adapter = require('./adapter');
let _defaultPostgresURL = process.env[Constants.EnvironmentVariables.postgres_url];
class PostgreSQL extends Adapter {
    constructor(connectionName, config) {
        super(connectionName, config);
        let validationResult = Joi.validate(config, PostgreSQL.schema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        this._adapterName = 'postgres';
        this._adapter = this.shimAdapter();
        this._options = validationResult.value['options'];
    }
    shimAdapter() {
        let adapter = require('sails-postgresql');
        return adapter;
    }
}
PostgreSQL.schema = Joi.object({
    type: Joi.string().valid('postgres'),
    options: Joi.object().required().keys({
        url: Joi.string().default(_defaultPostgresURL).uri({ scheme: 'postgres' }),
        pool: Joi.boolean().default(false),
        ssl: Joi.boolean().default(false)
    })
});
module.exports = PostgreSQL;
//# sourceMappingURL=postgresql.js.map