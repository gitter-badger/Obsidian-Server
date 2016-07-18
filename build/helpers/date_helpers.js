"use strict";
const Moment = require('moment');
function format(date) {
    let moment = Moment(date);
    return moment.toISOString();
}
exports.format = format;
//# sourceMappingURL=date_helpers.js.map