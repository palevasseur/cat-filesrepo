/// <reference path="../typings/node/node.d.ts" />

class Config {
    constructor() {
        var appConfig = require('../config.json');
        var currentConfig = process.env.NODE_ENV ? appConfig[process.env.NODE_ENV] : appConfig[appConfig["current"]];
        for (var name in currentConfig) {
            this[name] = currentConfig[name];
        }
    }
}

export = Config;