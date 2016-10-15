#!/usr/bin/env node

var
	bole   = require('bole'),
	Opsbot = require('../index'),
	path   = require('path'),
	yargs  = require('yargs')
	;

var parser = yargs
	.usage('opsbot path/to/config/file.js')
	.demand(1)
	.help('help', 'show this help')
	.epilog('put your plugins into the configuration file!')
	;

var argv = yargs.argv;

var cf = path.resolve(process.cwd(), argv._[0]);
var config = require(cf);
config.listen = process.env.PORT || config.listen || 3000;

var outputs = [];
if (process.env.NODE_ENV === 'dev')
{
	var prettystream = require('bistre')({ time: true }); // pretty
	prettystream.pipe(process.stdout);
	outputs.push({ level: 'debug', stream: prettystream });
}
else
	outputs.push({level: 'info', stream: process.stdout });

bole.output(outputs);

var opsbot = new Opsbot(config);
opsbot.listen();
