/// <reference path="../typings/node/node.d.ts" />

class Config {
    constructor() {
        var appConfig = require('../config.json');
        var currentConfig = appConfig[appConfig["current"]]
        for (var name in currentConfig) {
            this[name] = currentConfig[name];
        }
    }

}

export = Config;