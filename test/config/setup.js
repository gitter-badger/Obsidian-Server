'use strict';

const path = require('path');
const fs = require('fs-extra');
const supertest = require('supertest');
const bootstrap = require('./bootstrap');

module.exports = (before, after) => {
    
    let doneCallback;

    const env = 'basic';

    const envSource = path.join(__filename, '../../env_source/', env);
    const tempEnv = path.join(__filename, '../../env/', env);

    before(function (done) {

        fs.removeSync(tempEnv);
        fs.copySync(envSource, tempEnv);

        bootstrap('../env/' + env + '/environment.json', '../env/' + env + '/resources.json', teardown => {
            doneCallback = teardown;
            done();
        });
    });

    after(function (done) {
        doneCallback(err => {
            fs.removeSync(tempEnv);
            done(err);
        });
    });

    return supertest('http://127.0.0.1:8000');
};