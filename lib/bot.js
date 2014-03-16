var
    events = require('events'),
    util   = require('util')
    ;

var Bot = module.exports = function Bot(opts)
{
    this.plugins = [];
};
util.inherits(Bot, events.EventEmitter);

Bot.prototype.plugins = null;

Bot.prototype.help = function help()
{

};

