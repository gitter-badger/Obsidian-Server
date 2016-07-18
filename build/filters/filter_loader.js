"use strict";
const UserAuthenticationFilter = require('./user_authentication_filter');
function loadFilter(name, options) {
    switch (name) {
        case UserAuthenticationFilter.filterName: {
            return new UserAuthenticationFilter(options);
        }
    }
    let errorString = 'Unknown filter: `' + name + '`';
    throw new Error(errorString);
}
exports.loadFilter = loadFilter;
//# sourceMappingURL=filter_loader.js.map