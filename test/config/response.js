'use strict';

const _ = require('lodash');
const chai = require('chai');
const should = chai.should();
const moment = require('moment');
chai.use(require('chai-moment'));

module.exports = res => {
    const keys = {
        '_requestID': sh => { return sh.that.is.a('string'); },
        '_requestTimestamp': sh => { return sh.beforeMoment(moment()); },
        '_responseTimestamp': sh => { return sh.beforeMoment(moment()); }
    };
    _.each(keys, (func, key) => {
        func(res.body.should.have.property(key));
    });
};