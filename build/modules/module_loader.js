"use strict";
const UserAuthentication = require('./user_authentication/user_authentication');
function loadModule(name, options) {
    switch (name) {
        case UserAuthentication.moduleName: {
            return new UserAuthentication(options);
        }
    }
    let errorString = 'Unknown module: `' + name + '`';
    throw new Error(errorString);
}
exports.loadModule = loadModule;
//# sourceMappingURL=module_loader.js.map