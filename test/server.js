'use strict';

const should = require('chai').should();
const api = require('supertest')('http://127.0.0.1:8000');
const bootstrap = require('./bootstrap');
const creds = require('./creds');

describe('Basic Server Functionality', function () {

    let doneCallback;

    before(function (done) {
        bootstrap('envs/basic/environment.json', 'envs/basic/resources.json', teardown => {
            doneCallback = teardown;
            done();
        });
    });

    after(function (done) {
        doneCallback(done);
    });

    it('errors if no credentials are passed', done => {
        api.get('/').expect(401, done);
    });

    it('errors if no path is passed', done => {
        api.get('/').set(creds).expect(404, done);
    });



});