"use strict";
const Hapi = require('hapi');
const Boom = require('boom');
const Joi = require('joi');
const Promise = require('bluebird');
const Path = require('path');
const _ = require('lodash');
let Negotiator = require('negotiator');
let MessagePack = require('msgpack5')();
const Constants = require('../config/constants');
const Logger = require('../app/logger');
const Method = require('./methods/method');
const Request = require('./request');
const ErrorResponse = require('./responses/error_response');
const ResponseSerializer = require('./response_serializer');
const MetadataMethod = require('./methods/metadata_method');
const CreateMethod = require('./methods/create_method');
const ReadMethod = require('./methods/read_method');
const UpdateMethod = require('./methods/update_method');
const DestroyMethod = require('./methods/destroy_method');
const CustomMethod = require('./methods/custom_method');
let SupportedContentTypes = {
    'application/json': Constants.ContentType.JSON,
    'application/msgpack': Constants.ContentType.MessagePack
};
let _defaultPort = function () {
    let portString = process.env[Constants.EnvironmentVariables.port];
    if (portString)
        return parseInt(portString);
    else
        return Constants.DefaultPort;
}();
class Server {
    constructor(environment, resources, orm, authenticator) {
        this._methods = [];
        let validationResult = Joi.validate(environment.config, Server.validationSchema);
        if (validationResult.error) {
            throw validationResult.error;
        }
        this._authenticator = authenticator;
        this._customConfig = environment.custom;
        let serverConfig = validationResult.value['server'];
        this._server = new Hapi.Server();
        this._connectionOptions = {
            host: serverConfig['host'],
            port: serverConfig['port']
        };
        this._server.connection(this._connectionOptions);
        this.registerEndpoints(resources, orm);
    }
    registerEndpoints(resources, orm) {
        let metadataMethod = new MetadataMethod(resources.metadata);
        this.registerMethod(metadataMethod);
        _.each(resources.resources, function (resource) {
            _.each(this.generateMethods(resource, orm), function (method) {
                this.registerMethod(method, resource.name);
            }, this);
        }, this);
        let catchallMethod = new Method('*', '\{p*}');
        this.registerMethod(catchallMethod);
    }
    generateMethods(resource, orm) {
        let self = this;
        let model = orm.model(resource.name);
        let methods = _.map(resource.methodDescriptors, function (descriptor) {
            let type = descriptor.type;
            let method;
            switch (type) {
                case Constants.MethodType.Create: {
                    method = new CreateMethod(resource, descriptor, model);
                    break;
                }
                case Constants.MethodType.Read: {
                    method = new ReadMethod(resource, descriptor, model);
                    break;
                }
                case Constants.MethodType.Update: {
                    method = new UpdateMethod(resource, descriptor, model);
                    break;
                }
                case Constants.MethodType.Destroy: {
                    method = new DestroyMethod(resource, descriptor, model);
                    break;
                }
                case Constants.MethodType.Custom: {
                    method = new CustomMethod(resource, descriptor, model, orm.models, self._customConfig, descriptor.method, descriptor.modulePath);
                    break;
                }
            }
            if (method) {
                _.each(descriptor.filters, function (filter) {
                    filter.orm = orm;
                });
                method.filters = descriptor.filters;
            }
            return method;
        });
        _.each(resource.modules, function (m) {
            let customMethods = m.generateMethods(model, resource);
            methods = methods.concat(customMethods);
        });
        let filteredMethods = _.reject(methods, function (method) {
            return !method;
        });
        return filteredMethods;
    }
    registerMethod(method, basePath = '') {
        let self = this;
        let path = '/' + Path.join(basePath, method.name);
        let routeConfig = {
            path: path,
            method: method.verb,
            handler: function (request, reply) {
                self.handleRequest(method, request, reply);
            }
        };
        this._server.route(routeConfig);
        this._methods.push(method);
    }
    handleRequest(method, hapiRequest, reply) {
        let self = this;
        let request = new Request();
        let respond = function (response) {
            self.respond(method, request, response, hapiRequest, reply);
        };
        request.headers = hapiRequest.headers;
        this.authenticateClient(request).bind(this).then(function (authenticated) {
            if (authenticated) {
                let params = {};
                _.merge(params, hapiRequest.params, hapiRequest.query, hapiRequest.payload);
                return self.validateParameters(params, method.validators());
            }
            else {
                let error = Boom.unauthorized();
                throw error;
            }
        }).then(function (params) {
            request.params = params;
            return method.transformRequest(request).then(function (req) {
                let filterPromises = _.map(method.filters, function (filter) {
                    return filter.before(req);
                });
                return Promise.all(filterPromises).then(function () {
                    return self.runMethod(method, req);
                });
            });
        }).then(function (response) {
            if (!(response instanceof ErrorResponse)) {
                method.transformResponse(response).then(function (res) {
                    respond(res);
                });
            }
            else {
                respond(response);
            }
        }).catch(function (error) {
            let response = new ErrorResponse(error);
            respond(response);
        });
    }
    validateParameters(params, schemas) {
        return new Promise(function (fulfill, reject) {
            let reduced = _.reduce(schemas, function (newSchema, result) {
                return result.concat(newSchema);
            }, Joi.object());
            let result = Joi.validate(params, reduced);
            if (result.error)
                reject(result.error);
            else
                fulfill(result.value);
        });
    }
    authenticateClient(request) {
        if (this._authenticator) {
            let clientKeyHeader = request.headers[Constants.AuthHeaders.clientKey];
            let clientSecretHeader = request.headers[Constants.AuthHeaders.clientSecret];
            return this._authenticator.authenticate(clientKeyHeader, clientSecretHeader);
        }
        else {
            return new Promise(function (fulfill, reject) { fulfill(true); });
        }
    }
    runMethod(method, request) {
        return new Promise(function (fulfill, reject) {
            method.handle(request, fulfill);
        });
    }
    ;
    respond(method, request, response, hapiRequest, reply) {
        let nodeRequest = hapiRequest.raw.req;
        let contentNegotiator = new Negotiator(nodeRequest);
        let availableTypes = _.keys(SupportedContentTypes);
        let candidates = contentNegotiator.mediaTypes(availableTypes);
        let contentTypeCandidate = candidates[0];
        let replyContentType = SupportedContentTypes[contentTypeCandidate];
        if (replyContentType != null) {
            let serializer = new ResponseSerializer(request, response);
            let responseObject = serializer.serialize();
            let responseData;
            switch (replyContentType) {
                case Constants.ContentType.JSON: {
                    responseData = responseObject;
                    break;
                }
                case Constants.ContentType.MessagePack: {
                    responseData = MessagePack.encode(responseObject);
                    break;
                }
            }
            let hapiResponse = reply(responseData);
            hapiResponse.type(contentTypeCandidate);
            hapiResponse.code(response.statusCode);
            _.each(response.responseHeaders, function (v, k) {
                hapiResponse.header(k, v);
            });
            let responseString = response.statusCode + ' ' + method.verb + ' ' + hapiRequest.path + ' (' + request.id + ')';
            Logger.http(responseString);
        }
        else {
            let empty = new Buffer(0);
            let hapiResponse = reply(empty);
            hapiResponse.code(Constants.HTTPStatusCode.NotAcceptable);
        }
    }
    start() {
        var self = this;
        return new Promise(function (fulfill, reject) {
            self._server.start(function (err) {
                if (err)
                    reject(err);
                else {
                    Logger.info('Started server with options', self._connectionOptions);
                    fulfill(undefined);
                }
            });
        });
    }
    stop() {
        var self = this;
        return new Promise(function (fulfill, reject) {
            self._server.stop(null, function () {
                fulfill(undefined);
            });
        });
    }
    get methods() {
        return this._methods;
    }
}
Server.validationSchema = Joi.object({
    server: Joi.object({
        host: Joi.alternatives([Joi.string().hostname(), Joi.string().ip({})]).required(),
        port: Joi.number().default(_defaultPort).min(Constants.serverPorts.min).max(Constants.serverPorts.max)
    }).required()
}).unknown().required();
module.exports = Server;
//# sourceMappingURL=server.js.map