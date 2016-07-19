'use strict';

const _ = require('lodash');
const should = require('chai').should();

module.exports = res => {
    const keys = ['_requestID', '_requestTimestamp', '_responseTimestamp'];
    _.each(keys, key => {
        res.body.should.have.property(key).that.is.a('string');
        delete res.body[key];
    });
};