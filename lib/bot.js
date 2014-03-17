var
    _      = require('lodash'),
    assert = require('assert'),
    events = require('events'),
    path   = require('path'),
    util   = require('util'),
    P      = require('bluebird')
    ;

var Bot = module.exports = function Bot(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.log, 'you must pass a bunyan logger in `opts.log`');
    assert(opts.botname, 'you must pass a name in `opts.botname`');

    var self = this;
    this.name = opts.botname;
    this.namePattern = new RegExp('^' + this.name + '[:]?\\s+');
    this.log = opts.log;
    this.plugins = [];

    _.each(opts.plugins, function(plugopts, k)
    {
        var Plugin = require(path.join('..', 'plugins', k));
        self.log.info('loaded plugin ' + k)
        plugopts = plugopts || {};
        plugopts.log = opts.log;
        var p = new Plugin(plugopts);
        self.plugins.push(p);
    });
};
util.inherits(Bot, events.EventEmitter);

Bot.prototype.plugins = null;

Bot.prototype.handleMessage = function handleMessage(message)
{
    var str = message.text.trim().replace(this.namePattern, '');

    var handler;
    for (var i = 0; i < this.plugins.length; i++)
    {
        if (this.plugins[i].matches(str))
        {
            handler = this.plugins[i];
            break;
        }
    }

    if (handler)
    {
        if (handler.promises) // HACK HACK HACK
            return handler.respond(str)
        return P.promisify(handler.respond, handler)(str);
    }
    if (!this.namePattern.test(message.text)) return P.resolve(null);

    switch(str)
    {
    case 'help':
        return P.resolve(this.help());

    case 'status':
        return P.resolve(this.status());

    default:
        return P.resolve(null);
    }
};

Bot.prototype.status = function status()
{
    return 'bot status report TODO'
};

Bot.prototype.help = function help()
{
    var result = _.map(this.plugins, function(p)
    {
        return '\n' + p.help();
    });

    result.unshift('\nPlugins:');
    result.unshift('How to drive the bot: "' + this.name + ': <command>"');
    return result.join('\n');
};
