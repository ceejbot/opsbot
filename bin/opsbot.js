#!/usr/bin/env node

var
    dashdash = require('dashdash'),
    logging  = require('../lib/logging'),
    path     = require('path')
    ;

var options =
[
    { names: ['help', 'h'], type: 'bool', help: 'Print this help and exit.' },
    {
        names   : ['config', 'f'],
        type    : 'string',
        help    : 'path to config file',
        helpArg : 'filename',
        default :  path.resolve(__dirname, '..', 'config.js')
    }
];
var parser = dashdash.createParser({options: options});
try { var opts = parser.parse(process.argv); } catch (e)
{
    console.error('opsbot: error: %s', e.message);
    process.exit(1);
}

if (opts.help)
{
    var help = parser.help({includeEnv: true}).trimRight();
    console.log('usage: opsbot [OPTIONS]\n' + 'options:\n' + help);
    process.exit(0);
}

var Opsbot;
try { Opsbot = require('../index'); } catch(err) {}
if (!Opsbot)
{
    try { Opsbot = require('opsbot'); } catch(err) {}
}

if (!Opsbot)
{
    console.error('Cannot find the opsbot module to load.');
    process.exit(1);
}

var config = require(opts.config);
config.log = logging(config);
config.listen = process.env.PORT || config.listen || 3000;

var opsbot = new Opsbot(config);
opsbot.listen();
