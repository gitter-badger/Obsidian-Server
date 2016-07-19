'use strict';

const should = require('chai').should();
const supertest = require('supertest');
const bootstrap = require('./bootstrap');
const creds = require('./creds');
const response = require('./response');

describe('Basic Server Functionality', function () {

    let doneCallback;
    let api;

    before(function (done) {
        bootstrap('envs/basic/environment.json', 'envs/basic/resources.json', teardown => {
            doneCallback = teardown;
            api = supertest('http://127.0.0.1:8000');
            done();
        });
    });

    after(function (done) {
        doneCallback(done);
    });

    it('401 if no credentials are passed', done => {
        api.get('/').expect('Content-Type', /json/).expect(401).expect(response).end(done);
    });

    it('404 if no path is passed', done => {
        api.get('/').set(creds).expect('Content-Type', /json/).expect(404).expect(response).end(done);
    });

    it('404 if a nonexistent is passed', done => {
        api.get('/fasdjfaksdfljaksdf').set(creds).expect('Content-Type', /json/).expect(404).expect(response).end(done);
    });

    it('returns metadata from /_metadata endpoint', done => {
        api.get('/_metadata').set(creds).expect('Content-Type', /json/).expect(response).expect(200, {
            _data: {
                name: 'test',
                version: '0.0.1'
            },
            _type: 'metadata'
        }).end(done);
    });
});