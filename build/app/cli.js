"use strict";
const Commander = require('commander');
const Constants = require('../config/constants');
class CLI {
    constructor() {
        this._parser = Commander.version(Constants.version);
    }
    addOption(option, description) {
        this._parser.option(option, description);
    }
    addCommand(command, description, handler) {
        let self = this;
        this._parser.command(command, description);
        this._parser.on(command, function () {
            if (handler) {
                self._command = command;
                handler();
            }
        });
    }
    run(args) {
        this._parser.parse(args);
    }
    get options() {
        return this._parser.opts();
    }
    get command() {
        return this._command;
    }
}
module.exports = CLI;
//# sourceMappingURL=cli.js.map