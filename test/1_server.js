'use strict';

const rot = require('rot');
const _ = require('lodash');
const chai = require('chai');
const should = chai.should();
const setup = require('./config/setup');
const creds = require('./config/creds');
const response = require('./config/response');

describe('Basic Server Functionality', function () {

    const api = setup(before, after);

    it('401 if no credentials are passed', done => {
        api
        .get('/')
        .expect('Content-Type', /json/)
        .expect(401)
        .expect(response)
        .end(done);
    });

    it('401 if wrong credentials are passed', done => {
        let rottedCreds = _.mapValues(creds, v => { return rot(v); });
        api
        .get('/')
        .set(rottedCreds)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect(response)
        .end(done);
    });

    it('404 if no path is passed', done => {
        api
        .get('/')
        .set(creds)
        .expect('Content-Type', /json/)
        .expect(404)
        .expect(response)
        .end(done);
    });

    it('404 if a nonexistent is passed', done => {
        api
        .get('/fasdjfaksdfljaksdf')
        .set(creds)
        .expect('Content-Type', /json/)
        .expect(404)
        .expect(response)
        .end(done);
    });

    it('returns metadata from /_metadata endpoint', done => {
        api
        .get('/_metadata')
        .set(creds)
        .expect('Content-Type', /json/)
        .expect(response)
        .expect(200)
        .expect(res => {
            res.body.should.have.property('_type', 'metadata');
            res.body.should.have.property('_data').that.is.an('object');
            res.body._data.should.have.property('name', 'test');
            res.body._data.should.have.property('version', '0.0.1');
        })
        .end(done);
    });
});