'use strict';

const _ = require('lodash');
const chai = require('chai');
const should = chai.should();
chai.use(require('chai-moment'));
const setup = require('./config/setup');
const creds = require('./config/creds');
const response = require('./config/response');
const moment = require('moment');

describe('Create, Read, Update, Destroy', function () {

    const api = setup(before, after);

    // Create

    it('fails to create a default record with no credentials set', done => {
        api
            .post('/simpleTestResource/create')
            .expect('Content-Type', /json/)
            .expect(401)
            .expect(response)
            .end(done);
    });

    it('creates a default record with no attributes', done => {
        api
            .post('/simpleTestResource/create')
            .set(creds)
            .expect('Content-Type', /json/)
            .expect(201)
            .expect(response)
            .expect(res => {
                res.body.should.have.property('_type', 'simpleTestResource');
                res.body.should.have.property('_data').that.is.an('object');
                res.body._data.should.have.property('myString', null);
                res.body._data.should.have.property('id');
            })
            .end(done);
    });

    it('uses supplied default values when creating new records', done => {
        api
            .post('/intermediateTestResource/create')
            .set(creds)
            .expect('Content-Type', /json/)
            .expect(201)
            .expect(response)
            .expect(res => {

                res.body.should.have.property('_type', 'intermediateTestResource');
                res.body.should.have.property('_data').that.is.an('object');

                res.body._data.should.have.property('anInt', null);
                res.body._data.should.have.property('aFloat', null);
                res.body._data.should.have.property('aString', null);
                res.body._data.should.have.property('aBoolean', null);
                res.body._data.should.have.property('aDate', null);

                res.body._data.should.have.property('aDefaultInt', 462);
                res.body._data.should.have.property('aDefaultFloat', 125.56);
                res.body._data.should.have.property('aDefaultString', 'Guy Fieri');
                res.body._data.should.have.property('aDefaultBoolean', true);
                res.body._data.should.have.property('aDefaultDate').sameMoment(moment('2016-07-21T17:52:18.824Z'));

            })
            .end(done);
    });

    it('uses passed values when creating new records', done => {
        api
            .post('/simpleTestResource/create')
            .set(creds)
            .send({
                record: {
                    myString: 'dooba',
                    myOtherString: 'flooba'
                }
            })
            .expect('Content-Type', /json/)
            .expect(201)
            .expect(response)
            .expect(res => {
                res.body.should.have.property('_type', 'simpleTestResource');
                res.body.should.have.property('_data').that.is.an('object');
                res.body._data.should.have.property('id');
                res.body._data.should.have.property('myString', 'dooba');
                res.body._data.should.have.property('myOtherString', 'flooba');
            })
            .end(done);
    });

    // Read

    it('fails to read records with no credentials set', done => {
        api
            .get('/simpleTestResource/read')
            .expect('Content-Type', /json/)
            .expect(401)
            .expect(response)
            .end(done);
    });

    it('receives an empty array for an unmatchable criteria', done => {
        api
            .get('/simpleTestResource/read')
            .query({
                criteria: {
                    id: 100000
                }
            })
            .set(creds)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(response)
            .expect(res => {
                res.body.should.have.property('_type', 'simpleTestResource');
                res.body.should.have.property('_data').that.is.an('array').and.is.empty;
            })
            .end(done);
    });

    it('receives a non-empty array for a matchable criteria', done => {
        api
            .get('/simpleTestResource/read')
            .set(creds)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(response)
            .expect(res => {
                res.body.should.have.property('_data').that.is.an('array').and.is.not.empty;
            })
            .end(done);
    });

    // Update

    it('fails to update records with no credentials set', done => {
        api
            .patch('/simpleTestResource/update')
            .expect('Content-Type', /json/)
            .expect(401)
            .expect(response)
            .end(done);
    });

    it('fails to update records without a record object set', done => {
        api
            .patch('/simpleTestResource/update')
            .set(creds)
            .expect('Content-Type', /json/)
            .expect(response)
            .expect(422)
            .end(done);
    });

    it('fails to update records without a criteria object set', done => {
        api
            .patch('/simpleTestResource/update')
            .set(creds)
            .send({
                record: {
                    myString: 'Make America',
                    myOtherString: 'Great Again'
                }
            })
            .expect('Content-Type', /json/)
            .expect(response)
            .expect(422)
            .end(done);
    });

    it('updates a property on a record successfully', done => {
        api
            .patch('/simpleTestResource/update')
            .set(creds)
            .send({
                record: {
                    myString: 'Make America',
                    myOtherString: 'Great Again'
                },
                criteria: {
                    id: {
                        '>': 0
                    }
                }
            })
            .expect('Content-Type', /json/)
            .expect(response)
            .expect(res => {
                res.body.should.have.property('_type', 'simpleTestResource');
                res.body.should.have.property('_data').that.is.an('array').and.is.not.empty;
                _.each(res.body._data, o => {
                    o.should.have.property('myString', 'Make America');
                    o.should.have.property('myOtherString', 'Great Again');
                });
            })
            .end(done);
    });

    it('doesn\'t update properties on records that don\'t exist', done => {
        api
            .patch('/simpleTestResource/update')
            .set(creds)
            .send({
                record: {
                    myString: 'Make America',
                    myOtherString: 'Derp Again'
                },
                criteria: {
                    id: {
                        '>': 9999
                    }
                }
            })
            .expect('Content-Type', /json/)
            .expect(response)
            .expect(404)
            .end(done);
    });

    // Destroy

    it('fails to destroy records with no credentials set', done => {
        api
            .del('/simpleTestResource/destroy')
            .expect('Content-Type', /json/)
            .expect(401)
            .expect(response)
            .end(done);
    });

    it('fails to destroy records that don\'t exist', done => {
        api
            .del('/simpleTestResource/destroy')
            .set(creds)
            .query({
                criteria: {
                    id: {
                        '>' : 99999
                    }
                }
            })
            .expect('Content-Type', /json/)
            .expect(response)
            .expect(404)
            .end(done);
    });

    it('deletes all records matching a criteria', done => {
        api
            .del('/simpleTestResource/destroy')
            .set(creds)
            .query({
                criteria: {
                    id: {
                        '<' : 99999
                    }
                }
            })
            .expect('Content-Type', /json/)
            .expect(response)
            .expect(200)
            .expect(res => {
                res.body.should.have.property('_type', 'simpleTestResource');
                res.body.should.have.property('_data').that.is.an('array').and.is.not.empty;
            })
            .end(done);
    });

});