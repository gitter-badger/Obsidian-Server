"use strict";
const Path = require('path');
const FS = require('fs');
const Promise = require('bluebird');
const Sanitizer = require('sanitize-filename');
let Prompt = require('prompt');
let Untildify = require('untildify');
const Logger = require('./logger');
function environmentGenerator() {
    return {
        config: {
            server: {
                host: '0.0.0.0',
                port: 8000
            },
            db: {
                type: 'file',
                options: {
                    directory: './db/'
                }
            }
        },
        modules: {},
        custom: {}
    };
}
function _resourcesGenerator(name) {
    return {
        metadata: {
            name: name,
            version: '0.0.1'
        },
        resources: {}
    };
}
let promptSchema = {
    properties: {
        name: {
            description: 'Project Name:',
            required: true
        },
        location: {
            description: 'Project Location:',
            required: true,
            default: './'
        }
    }
};
function generate() {
    return new Promise(function (fulfill, reject) {
        Prompt.message = '';
        Prompt.delimiter = '';
        Logger.hideLabels().info('').showLabels();
        Prompt.start();
        Prompt.get(promptSchema, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                _generate(result.name, result.location);
                fulfill(undefined);
            }
        });
    });
}
exports.generate = generate;
function _sanitize(name) {
    var sanitized = Sanitizer(name);
    sanitized = sanitized.replace(/\s/g, '-');
    sanitized = sanitized.replace(/[^\w-]/g, '');
    while (true) {
        let newString = sanitized.replace(/-+/g, '-');
        if (sanitized == newString) {
            break;
        }
        sanitized = newString;
    }
    return sanitized.toLowerCase();
}
function _mkdir(path) {
    try {
        FS.mkdirSync(path);
    }
    catch (e) {
        if (e.code != 'EEXIST')
            throw e;
    }
}
function _writeJSON(path, json) {
    let jsonString = JSON.stringify(json, null, 2);
    FS.writeFileSync(path, jsonString);
}
function _generate(name, location) {
    Logger.info('Creating project directory...');
    let sanitizedName = _sanitize(name);
    let folder = Untildify(Path.join(location, sanitizedName));
    _mkdir(folder);
    Logger.info('Creating database directory...');
    let dbFolder = Path.join(folder, 'db');
    _mkdir(dbFolder);
    Logger.info('Creating environment.json...');
    let environment = environmentGenerator();
    let environmentPath = Path.join(folder, 'environment.json');
    _writeJSON(environmentPath, environment);
    Logger.info('Creating resources.json...');
    let resources = _resourcesGenerator(name);
    let resourcePath = Path.join(folder, 'resources.json');
    _writeJSON(resourcePath, resources);
}
//# sourceMappingURL=project_generator.js.map