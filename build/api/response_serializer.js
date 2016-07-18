"use strict";
const DateHelpers = require('../helpers/date_helpers');
class ResponseSerializer {
    constructor(request, response) {
        this._request = request;
        this._response = response;
    }
    serialize() {
        let response = {
            _type: this._response.type,
            _requestID: this._request.id,
            _requestTimestamp: DateHelpers.format(this._request.date),
            _responseTimestamp: DateHelpers.format(this._response.date),
            _data: this._response.responseObject
        };
        return response;
    }
}
module.exports = ResponseSerializer;
//# sourceMappingURL=response_serializer.js.map