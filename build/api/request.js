"use strict";
const Chance = require('chance');
const Moment = require('moment');
class Request {
    constructor() {
        this._id = Request.chance.guid();
        this._date = Moment().toDate();
    }
    set headers(headers) {
        this._headers = headers;
    }
    get headers() {
        return this._headers;
    }
    set params(params) {
        this._params = params;
    }
    get params() {
        return this._params;
    }
    get id() {
        return this._id;
    }
    get date() {
        return this._date;
    }
}
Request.chance = new Chance();
module.exports = Request;
//# sourceMappingURL=request.js.map