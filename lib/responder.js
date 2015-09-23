var
    _      = require('lodash'),
    assert = require('assert'),
    bole   = require('bole'),
    Brain  = require('./brain'),
    events = require('events'),
    moment = require('moment'),
    path   = require('path'),
    util   = require('util')
;

var Responder = module.exports = function Responder(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.botname, 'you must pass a name in `opts.botname`');

    var self = this;
    this.name = opts.botname;
    this.namePattern = new RegExp('^' + this.name + '[:;]?\\s+');
    this.log = bole('brain');
    this.plugins = {};
    this.starttime = Date.now();

    if (opts.brain)
        this.brain = new Brain(opts.brain);

    _.each(opts.plugins, function(plugopts, k)
    {
        var Plugin;

        try { Plugin = require(path.join('..', 'plugins', k)); }
        catch (ex) { }

        if (!Plugin)
        {
            try { Plugin = require(k); }
            catch (ex) { }
        }

        if (!Plugin)
        {
            self.log.warn('could not load plugin ' + k);
            return;
        }

        self.log.info('loaded plugin ' + k);
        plugopts = plugopts || {};
        plugopts.log = bole(k);
        if (self.brain)
            plugopts.brain = self.brain.get(k);

        var p = new Plugin(plugopts);
        self.plugins[k] = p;
    });
};
util.inherits(Responder, events.EventEmitter);

Responder.prototype.plugins = null;
Responder.prototype.brain = null;
Responder.prototype.starttime = null;

Responder.prototype.close = function close()
{
    if (this.brain) this.brain.close();
};

Responder.prototype.handleMessage = function handleMessage(message)
{
    message.text = message.text.replace(this.namePattern, '').trim();

    var matches = message.text.match(/^help (\w+)/);
    if (matches && this.plugins[matches[1]])
    {
        message.done(this.plugins[matches[1]].help());
        return;
    }

    var done = false;
    _.each(this.plugins, function(v, k)
    {
        if (v.matches(message.text))
        {
            v.respond(message);
            done = true;
        }
    });
    if (done) return;

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

Responder.prototype.status = function status()
{
    var result = [];
    result.push('Uptime: ' + moment.duration(Date.now() - this.starttime).humanize());
    result.push('Plugins: ' + _.map(this.plugins, 'name').join(', '));
    if (this.brain)
        result.push('Brain: ' + this.brain.opts.dbpath);

    return result.join('\n');
};

Responder.prototype.help = function help()
{
    var result =
    {
        attachments:  [],
        parse:        'full',
        unfurl_links: true
    };

    var lines =
    [
        '*HELP*',
        'To control the bot type `' + this.name + ': ` followed by a plugin command.',
        '*Commands*',
        '`' + this.name + ': help` - get this message',
        '`' + this.name + ': status` - get bot status',
    ];

    _.each(this.plugins, function(p)
    {
        lines.push('*' + p.name + '*');
        lines.push(p.help());
    });

    result.text = lines.join('\n');

    return result;
};
