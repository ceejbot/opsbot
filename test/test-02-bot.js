/*global describe:true, it:true, before:true, after:true */

var
    bunyan     = require('bunyan'),
    demand     = require('must'),
    Bot        = require('../lib/bot'),
    StatusCats = require('../plugins/statuscats')
    ;

describe('Bot', function()
{
    var log;

    before(function()
    {
        log = bunyan.createLogger({ name: 'test', streams: [] });
    })

    describe('constructor', function()
    {
        it('requires an options object', function()
        {
            function shouldThrow() { return new Bot(); }
            shouldThrow.must.throw(/options object/);
        });

        it('requires a log option', function()
        {
            function shouldThrow() { return new Bot({}); }
            shouldThrow.must.throw(/bunyan logger/);
        });

        it('can be constructed', function()
        {
            var bot = new Bot({ log: log, botname: 'test' });
        });
    });

    describe('plugins', function()
    {
        it('are loaded on construction', function()
        {
            var opts =
            {
                botname: 'test',
                log: log,
                plugins: { statuscats: {} }
            };

            var bot = new Bot(opts);
            bot.must.have.property('plugins');
            bot.plugins.must.have.length(1);
            var plugin = bot.plugins[0];
            plugin.must.be.instanceof(StatusCats);
        });

    });

    describe('message handling', function()
    {
        var bot;

        before(function()
        {
            var opts =
            {
                botname: 'test',
                log: log,
                plugins: { statuscats: {} }
            };
            bot = new Bot(opts);
        });

        it('handleMessage() returns a promise', function()
        {
            var reply = bot.handleMessage({ text: 'foo'});
            reply.must.be.an.object();
            reply.must.have.property('then');
            reply.then.must.be.a.function();
        });

        it('requires that either a plugin handle the message or that it begin with the name', function(done)
        {
            bot.handleMessage({ text: 'foo'})
            .then(function(reply)
            {
                demand(reply).be.null();
                return bot.handleMessage({ text: 'test: not-valid' });
            })
            .then(function(reply)
            {
                demand(reply).be.null();
                return bot.handleMessage({ text: 'test: not-valid' });
            }, function(err)
            {
                demand(err).not.exist();
            }).done();

            done();
        });

        it('responds to help in several variations', function(done)
        {
            bot.handleMessage({ text: 'test: help' })
            .then(function(reply)
            {
                reply.must.be.a.string();
                return bot.handleMessage({ text: 'test: help    ' });
            })
            .then(function(reply)
            {
                reply.must.be.a.string();
                done();
            }, function(err)
            {
                demand(err).not.exist();
            }).done();
        });

        it('passes messages to plugins for matching', function(done)
        {
            bot.handleMessage({text: 'test: statuscat 503'})
            .then(function(reply)
            {
                reply.must.be.a.string();
                reply.must.equal('http://httpcats.herokuapp.com/503');
                done();
            }, function(err)
            {
                demand(err).not.exist();
            }).done();
        });

        it('valid plugin commands work without the bot name prefix', function(done)
        {
            bot.handleMessage({text: 'statuscat 503'})
            .then(function(reply)
            {
                reply.must.be.a.string();
                reply.must.equal('http://httpcats.herokuapp.com/503');
                done();
            }, function(err)
            {
                demand(err).not.exist();
            }).done();
        });
    });
});
