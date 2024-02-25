// The entry point for Roobee. Starts a Roobee instance
require('module-alias/register')
const fs = require('fs');
const path = require('path');
const Roobee = require('@core/roobee');
const Config = require('@utils/config')

//Validate and load configuration file
const rootpath = __dirname;
const configfile = path.join(rootpath, "/config/config.json");
const configurator = new Config(configfile, rootpath);
const config = configurator.config;

//Start!
const roobee = new Roobee(config);
roobee.run();


