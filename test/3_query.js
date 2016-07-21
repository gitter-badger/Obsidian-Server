'use strict';

const _ = require('lodash');
const async = require('async');
const chai = require('chai');
chai.use(require('chai-moment'));
const should = chai.should();
const moment = require('moment');
const setup = require('./config/setup');
const creds = require('./config/creds');
const response = require('./config/response');

describe('Query Syntax', function () {

    // Counts

    const paginationRecordCount = 105;
    let totalRecordCount = 0;

    // Test records

    const simpleTestRecords = {
        int: { anInt: 9323 },
        float: { aFloat: 56.65 },
        string: { aString: 'That awkward moment when you realize you bought a gold MacBook.' },
        boolean: { aBoolean: true },
        date: { aDate: '2016-02-21T17:52:11.824Z' }
    }

    // Setup

    const api = setup(cb => {
        before(done => {
            cb(err => {

                if (err) {
                    done(err);
                    return;
                }

                // Insert a bunch of test records

                let records = [];

                records = records.concat(_.values(simpleTestRecords));

                // Insert records to test the pagination feature

                _.times(paginationRecordCount, function () {
                    records.push({
                        aString: 'pagination'
                    });
                });

                totalRecordCount = records.length;

                async.eachSeries(records, (record, cb) => {
                    api
                        .post('/intermediateTestResource/create')
                        .set(creds)
                        .send({
                            record: record
                        })
                        .expect('Content-Type', /json/)
                        .expect(201)
                        .expect(response)
                        .end(cb);
                }, done);

            });
        });
    }, after);

    // Helper

    function query(resource, query) {
        return api
            .get('/' + resource + '/read')
            .query(query)
            .set(creds)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(response);
    }

    // Basic Querying

    it('returns only one record when pagination is undefined', done => {
        query('intermediateTestResource', {}).expect(res => {
            res.body.should.have.property('_type', 'intermediateTestResource');
            res.body.should.have.property('_data').that.is.an('array').and.has.length.of(1);
        }).end(done);
    });

    // Simple Queries

    _.each(simpleTestRecords, (criteria, key) => {
        it('supports querying by ' + key, done => {
            query('intermediateTestResource', { criteria: criteria }).expect(res => {
                res.body.should.have.property('_type', 'intermediateTestResource');
                res.body.should.have.property('_data').that.is.an('array').and.has.length.of(1);
            }).end(done);
        });
    });

    // Pagination

    it('paginates results', done => {

        const pageSize = (paginationRecordCount / 4) >> 0;

        const pagination = [];
        let remaining = paginationRecordCount;
        let pageIndex = 1;

        while (remaining > 0) {
            const limit = Math.min(pageSize, remaining);
            pagination.push({
                page: pageIndex,
                limit: limit
            })
            pageIndex++;
            remaining -= limit;
        }

        async.eachSeries(pagination, (options, cb) => {
            query('intermediateTestResource', {
                criteria: {
                    aString: 'pagination'
                },
                sort: 'id ASC',
                pagination: options
            }).expect(res => {
                res.body.should.have.property('_type', 'intermediateTestResource');
                res.body.should.have.property('_data').that.is.an('array').and.has.length.of(options.limit);
            }).end(cb);
        }, done);

    });



});