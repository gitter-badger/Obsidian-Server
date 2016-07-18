"use strict";
const _ = require('lodash');
const Colors = require('colors');
const Errno = require('errno');
const Table = require('cli-table');
const Moment = require('moment');
let _Arrow = "==> ";
class Logger {
    constructor() {
        this._showLabels = true;
    }
    start() {
        return this;
    }
    log(source, message, meta, arrow = false, carriageReturn = false) {
        let emptyMessage = _.isEmpty(message);
        if (!message) {
            message = '';
        }
        if (arrow) {
            message = _Arrow + message;
        }
        let sourceString = carriageReturn ? '\r' : '';
        if (this._showLabels) {
            sourceString += source + ':';
        }
        let formattedMeta = Logger.formatObject(meta);
        if (!_.isEmpty(formattedMeta)) {
            if (!emptyMessage) {
                message += ':';
            }
            formattedMeta = Colors.cyan(formattedMeta);
        }
        if (_.isEmpty(sourceString)) {
            console.log(message, formattedMeta);
        }
        else {
            console.log(sourceString, message, formattedMeta);
        }
        return this;
    }
    db(message, meta, arrow = false, carriageReturn = false) {
        return this.log(Colors.blue('db'), message, meta, arrow, carriageReturn);
    }
    info(message, meta, arrow = false, carriageReturn = false) {
        return this.log(Colors.green('info'), message, meta, arrow, carriageReturn);
    }
    http(message, meta, arrow = false, carriageReturn = false) {
        return this.log(Colors.yellow('http'), message, meta, arrow, carriageReturn);
    }
    error(error, message) {
        var description = null;
        if (error) {
            description = error.message || 'unknown error';
            if (error.errno && error.code) {
                let errorDict = Errno.code[error.code];
                description = errorDict.description || description;
            }
        }
        return this.log(Colors.red('error'), message, description);
    }
    table(headers, rows) {
        let table = new Table({
            head: headers
        });
        _.each(rows, function (row) {
            table.push(row);
        });
        let tableString = table.toString();
        let split = tableString.split('\n');
        _.each(split, function (line) {
            this.info(line);
        }, this);
        return this;
    }
    hello() {
        let str = '\
oooooooooooooooo     ooooooooo ooooooo ooo  ooo ooooooo  ooo  oooooo  ooo\n\
oooooooooooooooo      ooooooo  ooooooo oooo ooo oooooooo ooo oooooooo ooo\n\
ooo          ooo        ooo    ooo     oooo ooo ooo  ooo ooo ooo      ooo\n\
oooooo    oooooo        ooo    oooooo  oooooooo ooo  ooo ooo ooo oo   ooo\n\
oooooo    oooooo        ooo    oooooo  oo ooooo ooo  ooo ooo ooo oooo ooo\n\
oooooo    oooooo        ooo    ooo     oo  oooo ooo  ooo ooo ooo  ooo ooo\n\
oooooo    ooo           ooo    ooo     oo  oooo ooo  ooo ooo oooo ooo ooo\n\
oooooo    ooo           ooo    ooooooo oo   ooo ooooooo  ooo  oooooo  ooo';
        let split = str.split('\n');
        let coloredSplit = _.map(split, function (line) {
            let first = line.substr(0, 16);
            let last = line.substr(16);
            return Colors.magenta(first) + Colors.white(last);
        });
        let joined = coloredSplit.join('\n');
        return this.hideLabels().info('\n' + joined + '\n').showLabels();
    }
    goodbye() {
        let message = 'that was tasty!';
        let functions = [
            'red',
            'green',
            'yellow',
            'magenta',
            'cyan'
        ];
        let colorIdx = 0;
        let str = '';
        _.each(message, function (letter) {
            let colorFunction = Colors[functions[colorIdx]];
            str += colorFunction(letter);
            if (letter != ' ') {
                colorIdx = (colorIdx + 1) % functions.length;
            }
        });
        return this.info(str);
    }
    static formatObject(object) {
        if (_.isNull(object) || _.isUndefined(object)) {
            return '';
        }
        if (_.isObject(object)) {
            if (_.isDate(object)) {
                let moment = Moment(object);
                let formatted = moment.format('MMMM Do YYYY, h:mm:ss a');
                return formatted;
            }
            let keys = _.map(object, function (v, k) {
                let str = k + '=';
                let wrap = _.isObject(v);
                if (wrap)
                    str += '{ ';
                str += Logger.formatObject(v);
                if (wrap)
                    str += ' }';
                return str;
            });
            return keys.join(' ');
        }
        return object.toString ? object.toString() : '' + object;
    }
    hideLabels() {
        this._showLabels = false;
        return this;
    }
    showLabels() {
        this._showLabels = true;
        return this;
    }
}
let sharedInstance = new Logger();
module.exports = sharedInstance;
//# sourceMappingURL=logger.js.map