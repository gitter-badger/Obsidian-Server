"use strict";
const _ = require('lodash');
const Promise = require('bluebird');
let Prompt = require('prompt');
let PrettyJSON = require('prettyjson');
const Logger = require('./logger');
class REPL {
    constructor(orm) {
        this._orm = orm;
        this._context = this._orm.models;
    }
    startPrompt() {
        if (!Prompt.started) {
            Prompt.message = '';
            Prompt.delimiter = '';
            Prompt.start();
        }
    }
    getCommand() {
        let self = this;
        return new Promise(function (fulfill, reject) {
            self.startPrompt();
            let schema = _.clone(REPL.commandSchema);
            Prompt.get(schema, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    fulfill(result.command);
                }
            });
        });
    }
    abstractEval(command) {
        let keys = _.keys(this);
        for (let i in keys) {
            let key = keys[i];
            let str = 'var ' + key + ' = this.' + key + ';';
            eval(str);
        }
        return eval(command);
    }
    evaluateCommand(command) {
        let self = this;
        return new Promise(function (fulfill, reject) {
            try {
                let result = self.abstractEval.call(self._context, command);
                fulfill(result);
            }
            catch (error) {
                fulfill(error);
            }
        });
    }
    printResult(result) {
        if (result instanceof Promise) {
            let promise = result;
            return promise.then(this.printResult);
        }
        Logger.hideLabels().info('').showLabels();
        if (_.isError(result)) {
            Logger.error(result);
        }
        else {
            try {
                let jsonResult = JSON.parse(JSON.stringify(result));
                let rendered = PrettyJSON.render(jsonResult);
                Logger.hideLabels().info(rendered).showLabels();
            }
            catch (e) {
                Logger.hideLabels().info(result).showLabels();
            }
        }
        Logger.hideLabels().info('').showLabels();
    }
    runner() {
        return this.getCommand().bind(this).then(this.evaluateCommand).then(this.printResult).then(this.runner);
    }
    run() {
        Logger.hideLabels().info('').showLabels();
        return this.runner().catch(function (error) {
            let pred = error.message == 'canceled';
            return pred;
        }, function (error) {
            Logger.hideLabels().info('').showLabels();
        });
    }
}
REPL.commandSchema = {
    properties: {
        command: {
            description: '>>'
        }
    }
};
module.exports = REPL;
//# sourceMappingURL=repl.js.map