"use strict";
const Path = require('path');
const Joi = require('joi');
let Untildify = require('untildify');
const Adapter = require('./adapter');
class File extends Adapter {
    constructor(environment, connectionName, config) {
        super(environment, connectionName, config);
        let validationResult = Joi.validate(config, File.schema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        this._adapterName = 'file';
        this._adapter = this.shimAdapter();
        let base = validationResult.value['options']['directory'];
        let joined = Path.join(environment.directory, base);
        console.log(joined);
        let path = Untildify(joined);
        this._options = {
            filePath: path,
            schema: true
        };
    }
    shimAdapter() {
        let adapter = require('sails-disk');
        return adapter;
    }
}
File.schema = Joi.object({
    type: Joi.string().valid('file'),
    options: Joi.object().required().keys({
        directory: Joi.string().min(1).required()
    })
});
module.exports = File;
//# sourceMappingURL=file.js.map