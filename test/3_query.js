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

    const paginationRecordCount = 105;

    let totalRecordCount = 0;

    const api = setup(cb => {
        before(done => {
            cb(err => {

                if (err) {
                    done(err);
                    return;
                }

                // Insert a bunch of test records

                const records = [];

                // Insert records to test the pagination feature

                _.times(paginationRecordCount, function () {
                    records.push({
                        aString: 'pagination'
                    });
                });

                totalRecordCount = records.length;

                async.each(records, (record, cb) => {
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

    // Query

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

        async.each(pagination, (options, cb) => {
            api
                .get('/intermediateTestResource/read')
                .query({
                    criteria: {
                        aString: 'pagination'
                    },
                    sort: 'id ASC',
                    pagination: options
                })
                .set(creds)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(response)
                .expect(res => {
                    res.body.should.have.property('_type', 'intermediateTestResource');
                    res.body.should.have.property('_data').that.is.an('array').and.has.length.of(options.limit);
                })
                .end(cb);
        }, done);

    });

});