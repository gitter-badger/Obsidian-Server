'use strict';

const _ = require('lodash');
const chai = require('chai');
chai.use(require('chai-moment'));
const should = chai.should();
const moment = require('moment');
const setup = require('./config/setup');
const creds = require('./config/creds');
const response = require('./config/response');

describe('Query Syntax', function () {

    const api = setup(before, after);

    before(done => {
    	// insert a bunch of test records here
    	done();
    });

});