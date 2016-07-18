"use strict";
const Joi = require('joi');
let Untildify = require('untildify');
const Adapter = require('./adapter');
class File extends Adapter {
    constructor(connectionName, config) {
        super(connectionName, config);
        let validationResult = Joi.validate(config, File.schema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        this._adapterName = 'file';
        this._adapter = this.shimAdapter();
        let path = Untildify(validationResult.value['options']['directory']);
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