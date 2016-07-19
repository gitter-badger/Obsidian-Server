'use strict';

const bootstrap = require('./bootstrap');
const supertest = require('supertest');

module.exports = (before, after) => {
    
    let doneCallback;

    before(function (done) {
        bootstrap('../envs/basic/environment.json', '../envs/basic/resources.json', teardown => {
            doneCallback = teardown;
            done();
        });
    });

    after(function (done) {
        doneCallback(done);
    });

    return supertest('http://127.0.0.1:8000');
};