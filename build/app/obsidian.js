"use strict";
const _ = require('lodash');
const Path = require('path');
const Promise = require('bluebird');
const Constants = require('../config/constants');
const Logger = require('./logger');
const CLI = require('./cli');
const AppMode = require('./appmode');
const Environment = require('../config/environment');
const Resources = require('../config/resources');
const DB = require('../db/db');
const ORM = require('../db/orm');
const MigrationStrategy = require('../db/migration_strategy');
const Server = require('../api/server');
const RoutePrinter = require('./route_printer');
const ProjectGenerator = require('./project_generator');
const REPL = require('./repl');
const Authenticator = require('../api/authenticator');
const ClientManager = require('./client_manager');
let commands = {
    'serve': { description: 'Start the Obsidian server', mode: AppMode.Server },
    'routes': { description: 'Print a list of exposed routes', mode: AppMode.RouteList },
    'new': { description: 'Generate a new project', mode: AppMode.NewProject },
    'repl': { description: 'Start the interactive console', mode: AppMode.REPL },
    'db:alter': { description: 'Migrate the database with the `alter` strategy', mode: AppMode.Migrate },
    'db:create': { description: 'Migrate the database with the `create` strategy', mode: AppMode.Migrate },
    'db:drop': { description: 'Migrate the database with the `drop` strategy', mode: AppMode.Migrate },
    'clients': { description: 'Print a list of authorized clients', mode: AppMode.ManageClients },
    'clients:add': { description: 'Add a new authorized client', mode: AppMode.ManageClients },
    'clients:remove': { description: 'Remove an authorized client', mode: AppMode.ManageClients }
};
let globalOptions = {
    '-r, --resources [path]': 'An optional path to resources.json.  By default, Obsidian searches in the current directory.',
    '-e, --environment [path]': 'An optional path to environment.json.  By default, Obsidian searches in the current directory.'
};
class ObsidianServer {
    constructor() {
        this._cli = new CLI();
        this.configureCLI();
    }
    startServer() {
        Logger.info('Starting server...');
        this._server = new Server(this._environment, this._resources, this._orm, this._authenticator);
        return this._server.start();
    }
    printRoutes() {
        RoutePrinter.printRoutes(this._environment, this._resources, this._orm);
        return null;
    }
    startREPL() {
        let repl = new REPL(this._orm);
        return repl.run();
    }
    manageClients() {
        if (this._cli.command == 'clients') {
            return ClientManager.list(this._authenticator);
        }
        else if (this._cli.command == 'clients:add') {
            return ClientManager.create(this._authenticator);
        }
        else if (this._cli.command == 'clients:remove') {
            return ClientManager.destroy(this._authenticator);
        }
    }
    loadORM() {
        return this.initializeORM();
    }
    migrateORM() {
        let command = this._cli.command;
        let strategyMap = {
            'db:alter': MigrationStrategy.Alter,
            'db:create': MigrationStrategy.Create,
            'db:drop': MigrationStrategy.Drop
        };
        let strategy = strategyMap[command];
        let rawCommand = command.replace('db:', '');
        Logger.info('Migrating database with the `' + rawCommand + '` strategy...');
        return this.initializeORM(strategy);
    }
    initializeORM(strategy = MigrationStrategy.Safe) {
        let self = this;
        return DB.load(this._environment).then(function (adapters) {
            let orm = new ORM(self._resources.resources, adapters, strategy);
            self._orm = orm;
            self.postLoad();
            return orm.connect();
        });
    }
    loadResources(path) {
        return new Promise(function (resolve, reject) {
            Logger.info('Loading resources...');
            let resources = new Resources(path);
            resources.load(function (error) {
                if (error)
                    reject(error);
                else
                    resolve(resources);
            });
        });
    }
    loadEnvironment(path) {
        return new Promise(function (resolve, reject) {
            Logger.info('Loading environment...');
            let environment = new Environment(path);
            environment.load(function (error) {
                if (error)
                    reject(error);
                else
                    resolve(environment);
            });
        });
    }
    preFlight() {
        this._authenticator = new Authenticator();
        this._resources.addResource(this._authenticator.resource);
    }
    postLoad() {
        this._authenticator.orm = this._orm;
    }
    loadConfiguration() {
        var self = this;
        let paths = {
            environment: this._cli.options['environment'] || ObsidianServer.getAbsolutePath('environment.json'),
            resources: this._cli.options['resources'] || ObsidianServer.getAbsolutePath('resources.json')
        };
        let promises = {
            environment: this.loadEnvironment(paths.environment),
            resources: this.loadResources(paths.resources)
        };
        return new Promise(function (fulfill, reject) {
            Promise.props(promises).then(function (results) {
                self._environment = results['environment'];
                self._resources = results['resources'];
                self.preFlight();
                fulfill(undefined);
            }).catch(reject);
        });
    }
    runMode(mode) {
        let self = this;
        Logger.hello();
        Logger.info('Obsidian Server version', Constants.version);
        let promise;
        switch (mode) {
            case AppMode.Server: {
                promise = this.loadConfiguration().bind(this).then(this.loadORM).then(this.startServer);
                break;
            }
            case AppMode.RouteList: {
                promise = this.loadConfiguration().bind(this).then(this.loadORM).then(this.printRoutes).then(this.teardownPromise);
                break;
            }
            case AppMode.NewProject: {
                promise = ProjectGenerator.generate().bind(this).then(this.teardownPromise);
                break;
            }
            case AppMode.REPL: {
                promise = this.loadConfiguration().bind(this).then(this.loadORM).then(this.startREPL).then(this.teardownPromise);
                break;
            }
            case AppMode.Migrate: {
                promise = this.loadConfiguration().bind(this).then(this.migrateORM).then(this.teardownPromise);
                break;
            }
            case AppMode.ManageClients: {
                promise = this.loadConfiguration().bind(this).then(this.loadORM).then(this.manageClients).then(this.teardownPromise);
                break;
            }
        }
        promise.catch(this.catchError);
    }
    catchError(error) {
        Logger.error(error, 'An unexpected error occurred');
        console.error(error);
        this.teardown(-1);
    }
    teardownPromise() {
        let self = this;
        return new Promise(function (fulfill, reject) {
            fulfill(self.teardown());
        });
    }
    teardown(exitCode = 0) {
        let self = this;
        let promises = [];
        if (this._orm) {
            promises.push(this._orm.disconnect());
        }
        if (this._server) {
            promises.push(this._server.stop());
        }
        Promise.all(promises).finally(function () {
            if (exitCode == 0) {
                Logger.goodbye();
            }
            process.exit(exitCode);
        });
    }
    configureCLI() {
        let self = this;
        Logger.start();
        _.each(globalOptions, function (description, option) {
            self._cli.addOption(option, description);
        });
        _.each(commands, function (command, name) {
            self._cli.addCommand(name, command.description, self.runMode.bind(self, command.mode));
        });
        this.registerInterruptHandler();
    }
    registerInterruptHandler() {
        let self = this;
        process.on('SIGINT', function () {
            Logger.info('Shutting down in response to interrupt signal...', null, false, true);
            self.teardown();
        });
    }
    run() {
        this._cli.run(process.argv);
    }
    static getAbsolutePath(filename) {
        return Path.join(process.cwd(), filename);
    }
}
module.exports = ObsidianServer;
//# sourceMappingURL=obsidian.js.map