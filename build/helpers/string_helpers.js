"use strict";
function prefixKey(prefix, key) {
    return prefix + '_' + key;
}
exports.prefixKey = prefixKey;
function startsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}
exports.startsWith = startsWith;
function getPath(file) {
    return file.substring(0, file.lastIndexOf("/"));
}
exports.getPath = getPath;
//# sourceMappingURL=string_helpers.js.map