"use strict";
const Joi = require('joi');
const Configuration = require('./configuration');
class Environment extends Configuration {
    validate(json) {
        let result = Joi.validate(json, Environment.validationSchema);
        let error = result.error || super.validate(result.value);
        if (error) {
            throw error;
        }
    }
    get config() {
        return super.get('config');
    }
    get modules() {
        return super.get('modules');
    }
    get custom() {
        return super.get('custom');
    }
}
Environment.validationSchema = Joi.object().keys({
    config: Joi.object().required(),
    modules: Joi.object().default({}),
    custom: Joi.object().default({})
});
module.exports = Environment;
//# sourceMappingURL=environment.js.map