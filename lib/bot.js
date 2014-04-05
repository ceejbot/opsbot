var
    _      = require('lodash'),
    assert = require('assert'),
    Brain  = require('./brain'),
    events = require('events'),
    moment = require('moment'),
    path   = require('path'),
    util   = require('util')
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
    this.starttime = Date.now();

    if (opts.brain)
        this.brain = new Brain(opts.brain);

    _.each(opts.plugins, function(plugopts, k)
    {
        var Plugin;

        try { Plugin = require(k); }
        catch (ex) { }

        if (!Plugin)
        {
            try { Plugin = require(path.join('..', 'plugins', k)); }
            catch (ex) { }
        }

        if (!Plugin)
        {
            self.log.warn('could not load plugin ' + k);
            return;
        }

        self.log.info('loaded plugin ' + k);
        plugopts = plugopts || {};
        plugopts.log = opts.log;
        if (this.brain)
            plugopts.brain = self.brain.get(k);

        var p = new Plugin(plugopts);
        self.plugins.push(p);
    });
};
util.inherits(Bot, events.EventEmitter);

Bot.prototype.plugins = null;
Bot.prototype.brain = null;
Bot.prototype.starttime = null;

Bot.prototype.handleMessage = function handleMessage(message)
{
    var original = message.text;
    message.text = message.text.replace(this.namePattern, '').trim();

    for (var i = 0; i < this.plugins.length; i++)
    {
        if (this.plugins[i].matches(message.text))
        {
            var handler = this.plugins[i];
            handler.respond(message);
            return;
        }
    }

    var txt;
    switch (message.text)
    {
    case 'help':
        txt = this.help();
        break;

    case 'status':
        txt = this.status();
        break;
    }
    message.done(txt);
};

Bot.prototype.status = function status()
{
    var result = [];
    result.push('Uptime: ' + moment.duration(Date.now() - this.starttime).humanize());
    result.push('Plugins: ' + _.map(this.plugins, 'name').join(', '));
    if (this.brain)
        result.push('Brain: ' + this.brain.opts.dbpath);

    return result.join('\n');
};

Bot.prototype.help = function help()
{
    var result =
    {
        text:         'HELP\nTo control the bot type `' + this.name + ': ` followed by a plugin command.',
        attachments:  [],
        parse:        'full',
        unfurl_links: true
    };

    result.attachments.push(
    {
        color:  '#ddccff',
        fields: [{
            title: 'commands',
            value: this.name + ': help - get this message\n' +
                   this.name + ': status - get bot status'
        }]
    });

    _.each(this.plugins, function(p)
    {
        var h = p.help();
        var struct =
        {
            color:   '#ddccff',
            fields: [{ title: p.name, value: h }]
        };
        result.attachments.push(struct);
    });

    return result;
};
