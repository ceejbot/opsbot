/*global describe:true, it:true, before:true, after:true */

var
    demand      = require('must'),
    MockMessage = require('./mocks/message'),
    Trello      = require('../plugins/trello')
    ;

describe('Trello', function()
{
    var fakeopts = { key: 'foo', token: 'bar', board: 'board', list: 'baz' };

    describe('plugin', function()
    {
        it('requires an options object', function()
        {
            function shouldThrow() { return new Trello(); }
            shouldThrow.must.throw(/options object/);
        });

        it('requires a key option', function()
        {
            function shouldThrow() { return new Trello({}); }
            shouldThrow.must.throw(/key/);
        });

        it('can be constructed', function()
        {
            var plugin = new Trello(fakeopts);
            plugin.must.be.truthy();
            plugin.must.have.property('help');
            plugin.help.must.be.a.function();
            plugin.must.have.property('matches');
            plugin.matches.must.be.a.function();
            plugin.must.have.property('respond');
            plugin.respond.must.be.a.function();
        });

        it('implements help() correctly', function()
        {
            var plugin = new Trello(fakeopts);
            var help = plugin.help();
            help.must.be.an.object();
            help.must.have.property('trello');
            help.trello.must.be.a.string();
        });

        it('implements matches() correctly', function()
        {
            var plugin = new Trello(fakeopts);
            plugin.matches('NOT VALID').must.be.false();
            plugin.matches('trello help').must.be.true();
            plugin.matches('trello card').must.be.true();
            plugin.matches('trello show    ').must.be.true();
        });

        it('implements respond() correctly', function(done)
        {
            var plugin = new Trello(fakeopts);
            var msg = new MockMessage({text: 'trello asdf'});
            msg.on('done', function() { done(); });
            plugin.respond(msg);
        });
    });

    describe('trello show', function()
    {
        it('has tests');
    });

    describe('trello card', function()
    {
        it('has tests');
    });
});
