var
    _        = require('lodash'),
    assert   = require('assert'),
    level    = require('level'),
    sublevel = require('level-sublevel')
    ;

// Brain manages the level db in which plugin data is stored.
// Plugins may ask it for the db, passing in their name. They
// get a sublevel-namespaced db instance to play with as they
// choose. The value encoding is `json` so plugins should pass
// js objects as values to put().

var Brain = module.exports = function Brain(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.dbpath && _.isString(opts.dbpath), 'you must pass a `dbpath` option');

    this.db = sublevel(level(opts.dbpath, { valueEncoding: 'json' }));
    this.plugindbs = {};
    this.opts = opts;
};

Brain.prototype.db = null;
Brain.prototype.plugindbs = null;

Brain.prototype.get = function get(plugin)
{
    assert(plugin && _.isString(plugin), 'you must pass your plugin\'s name as an argument');

    if (!this.plugindbs[plugin])
    {
        this.plugindbs[plugin] = this.db.sublevel(plugin);
    }

    return this.plugindbs[plugin];
};

Brain.prototype.close = function close(callback)
{
    var self = this;
    this.db.close(function()
    {
        self.db = null;
        callback();
    });
};
