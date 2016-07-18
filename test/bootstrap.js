'use strict';

const Obsidian = require('../build/app/obsidian');
const AppMode = require('../build/app/appmode');
const Path = require('path');

const file = __filename;
const wd = file.substring(0, file.lastIndexOf("/"));

module.exports = function(env, res, cb) {
    var o = new Obsidian();
    
    o._cli = {
        options: {
            environment: Path.join(wd, env),
            resources: Path.join(wd, res)
        }
    }; 

    o.runMode(AppMode.Server).then(function() {
        cb(function() {
            o.teardown();
        });
    });

};