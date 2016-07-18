"use strict";
const _ = require('lodash');
const Logger = require('./logger');
const Server = require('../api/server');
const ResourceMethod = require('../api/methods/resource_method');
function printRoutes(environment, resources, orm) {
    let server = new Server(environment, resources, orm);
    let routes = _.map(server.methods, function (method) {
        let response = {
            method: method.verb,
            path: '/' + method.name,
            resource: '/'
        };
        if (method instanceof ResourceMethod) {
            let resourceMethod = method;
            response.resource = '/' + resourceMethod.resource.name;
        }
        return response;
    });
    let groups = _.groupBy(routes, 'resource');
    _.each(groups, function (group) {
        Logger.hideLabels().info('').showLabels();
        let firstRoute = _.first(group);
        Logger.hideLabels().info('Resource `' + firstRoute.resource + '` exposes the following routes:').showLabels();
        let headers = ['Method', 'Resource', 'Path'];
        let rows = _.map(group, function (route) {
            return [route.method, route.resource, route.path];
        });
        Logger.hideLabels().table(headers, rows).showLabels();
    });
    Logger.hideLabels().info('').showLabels();
}
exports.printRoutes = printRoutes;
//# sourceMappingURL=route_printer.js.map