'use strict';

const _ = require('lodash');

module.exports = res => {
    const keys = ['_requestID', '_requestTimestamp', '_responseTimestamp'];
    _.each(keys, key => {
        if (!(key in res.body)) throw new Error("missing " + key + " key");
        delete res.body[key];
    });
};