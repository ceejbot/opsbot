#!/usr/bin/env node

var
	bole   = require('bole'),
	Opsbot = require('../index'),
	path   = require('path')
	;

if (process.argv.length < 3)
{
	console.error('usage: opsbot path/to/config/file.js');
	process.exit(1);
}

var cf = path.resolve(process.cwd(), process.argv[2]);
var config = require(cf);

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
opsbot.start();
