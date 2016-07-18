"use strict";
const _ = require('lodash');
const Boom = require('boom');
const Constants = require('../../config/constants');
const Response = require('./response');
class ErrorResponse extends Response {
    constructor(error) {
        let boomError;
        if (error.isBoom) {
            boomError = error;
        }
        else if (error.code == 'E_VALIDATION') {
            let reasons = error.messages;
            let data = {
                reasons: reasons
            };
            boomError = Boom.create(error.status, "Validation Failed", data);
        }
        else if (error.name == 'ValidationError') {
            let joiError = error;
            let reasons = {};
            _.each(joiError.details, function (detail) {
                reasons[detail.path] = detail.message;
            });
            let data = {
                reasons: reasons
            };
            boomError = Boom.create(Constants.HTTPStatusCode.UnprocessableEntity, "Validation Failed", data);
        }
        else if (_.isString(error.details)) {
            boomError = Boom.create(Constants.HTTPStatusCode.InternalServerError, error.details);
        }
        else if (_.isString(error.message)) {
            boomError = Boom.create(Constants.HTTPStatusCode.InternalServerError, error.message);
        }
        else {
            boomError = Boom.wrap(error);
        }
        let payload = ErrorResponse.generatePayload(boomError);
        super(Constants.ResponseType.error, payload, boomError.output.statusCode);
    }
    static generatePayload(error) {
        let payload = {};
        payload.error = error.output.payload.error;
        payload.message = error.message || error.output.payload.message;
        if (error.data && error.data.reasons) {
            payload.reasons = error.data.reasons;
        }
        return payload;
    }
}
module.exports = ErrorResponse;
//# sourceMappingURL=error_response.js.map