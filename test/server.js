'use strict';

const should = require('chai').should();
const supertest = require('supertest');
const api = supertest('http://127.0.0.1:8000');
const bootstrap = require('./bootstrap');

describe('Server', function() {
    it('errors if no credentials are passed', done => {
        bootstrap('envs/basic/environment.json', 'envs/basic/resources.json', teardown => {
            api.get('/').expect(401, err => {
                teardown();
                done(err);
            });
        });
    });
});