"use strict";
class Adapter {
    constructor(environment, connectionName, config) {
        this._connectionName = connectionName;
    }
    get adapterName() {
        return this._adapterName;
    }
    get adapter() {
        return this._adapter;
    }
    get connectionName() {
        return this._connectionName;
    }
    get options() {
        return this._options;
    }
}
module.exports = Adapter;
//# sourceMappingURL=adapter.js.map