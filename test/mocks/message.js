var
    _      = require('lodash'),
    events = require('events'),
    util   = require('util')
    ;

var MockMessage = module.exports = function MockMessage(opts)
{
    events.EventEmitter.call(this);
    _.defaults(this, opts);
};
util.inherits(MockMessage, events.EventEmitter);

MockMessage.prototype.send = function send(msg)
{
    this.emit('send', msg);
};

MockMessage.prototype.done = function done(msg)
{
    if (msg) this.emit('send', msg);
    this.emit('done');
};
