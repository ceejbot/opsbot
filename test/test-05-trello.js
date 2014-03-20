/*global describe:true, it:true, before:true, after:true */

var
    demand     = require('must'),
    Trello = require('../plugins/trello')
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
            plugin.must.have.property('respondAsync');
            plugin.respondAsync.must.be.a.function();
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

            plugin.must.have.property('respondAsync');

            var reply = plugin.respondAsync('trello asdf');
            reply.must.be.an.object();
            reply.must.have.property('then');
            reply.then.must.be.a.function();

            reply.then(function(r)
            {
                r.must.be.a.string();
                done();
            }).done();
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
