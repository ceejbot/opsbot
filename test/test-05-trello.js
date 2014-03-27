'use strict';

var
    lab         = require('lab'),
    describe    = lab.describe,
    it          = lab.it,
    demand      = require('must'),
    MockMessage = require('./mocks/message'),
    Trello      = require('../plugins/trello')
    ;

describe('Trello', function()
{
    var fakeopts = { key: 'foo', token: 'bar', board: 'board', list: 'baz' };

    describe('plugin', function()
    {
        it('requires an options object', function(done)
        {
            function shouldThrow() { return new Trello(); }
            shouldThrow.must.throw(/options object/);
            done();
        });

        it('requires a key option', function(done)
        {
            function shouldThrow() { return new Trello({}); }
            shouldThrow.must.throw(/key/);
            done();
        });

        it('can be constructed', function(done)
        {
            var plugin = new Trello(fakeopts);
            plugin.must.be.truthy();
            plugin.must.have.property('help');
            plugin.help.must.be.a.function();
            plugin.must.have.property('matches');
            plugin.matches.must.be.a.function();
            plugin.must.have.property('respond');
            plugin.respond.must.be.a.function();
            done();
        });

        it('implements help() correctly', function(done)
        {
            var plugin = new Trello(fakeopts);
            var help = plugin.help();
            help.must.be.a.string();
            help.length.must.be.above(0);
            done();
        });

        it('implements matches() correctly', function(done)
        {
            var plugin = new Trello(fakeopts);
            plugin.matches('NOT VALID').must.be.false();
            plugin.matches('trello help').must.be.true();
            plugin.matches('trello card').must.be.true();
            plugin.matches('trello show    ').must.be.true();
            done();
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
        it('has tests', function(done) { done(); });
    });

    describe('trello card', function()
    {
        it('has tests', function(done) { done(); });
    });
});
