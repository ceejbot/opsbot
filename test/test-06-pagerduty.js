'use strict';

var
    lab         = require('lab'),
    describe    = lab.describe,
    it          = lab.it,
    before      = lab.before,
    demand      = require('must'),
    MockMessage = require('./mocks/message'),
    PagerDuty   = require('../plugins/pagerduty')
    ;

describe('PagerDuty', function()
{
    var fakeopts = { apikey: 'foo', urlprefix: 'bar' };

    describe('plugin', function()
    {
        it('requires an options object', function(done)
        {
            function shouldThrow() { return new PagerDuty(); }
            shouldThrow.must.throw(/options object/);
            done();
        });

        it('requires a key option', function(done)
        {
            function shouldThrow() { return new PagerDuty({}); }
            shouldThrow.must.throw(/apikey/);
            done();
        });

        it('can be constructed', function(done)
        {
            var plugin = new PagerDuty(fakeopts);
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
            var plugin = new PagerDuty(fakeopts);
            var help = plugin.help();
            help.must.be.a.string();
            help.length.must.be.above(0);
            done();
        });

        it('implements matches() correctly', function(done)
        {
            var plugin = new PagerDuty(fakeopts);
            plugin.matches('NOT VALID').must.be.false();
            plugin.matches('pagerduty help').must.be.true();
            plugin.matches('pagerduty oncall').must.be.true();
            plugin.matches('pagerduty rotation    ').must.be.true();
            done();
        });

        it('implements respond() correctly', function(done)
        {
            var plugin = new PagerDuty(fakeopts);
            plugin.must.have.property('respond');

            var msg = new MockMessage({text: 'pagerduty asdf'});
            msg.on('done', function() { done(); });
            plugin.respond(msg);
        });
    });

    describe('pattern', function()
    {
        var plugin;

        before(function(done)
        {
            plugin = new PagerDuty(fakeopts);
            done();
        });

        it('matches `pagerduty help`', function(done)
        {
            plugin.matches('pagerduty help').must.be.true();
            done();
        });

        it('matches `pagerduty oncall`', function(done)
        {
            plugin.matches('pagerduty oncall').must.be.true();
            done();
        });

        it('matches `who\'s on call`', function(done)
        {
            plugin.matches("who's on call").must.be.true();
            var matches = "who's on call".match(plugin.pattern);
            console.log(matches);
            done();
        });

        it('matches `pagerduty rotation`', function(done)
        {
            plugin.matches('pagerduty rotation').must.be.true();
            done();
        });

        it('matches `pagerduty incidents`', function(done)
        {
            plugin.matches('pagerduty incidents').must.be.true();
            done();
        });

        it('matches `pagerduty incident four`', function(done)
        {
            plugin.matches('pagerduty incident four').must.be.true();
            done();
        });

        it('matches `pagerduty ack four`', function(done)
        {
            plugin.matches('pagerduty ack four').must.be.true();
            done();
        });

        it('matches `pagerduty resolve four`', function(done)
        {
            plugin.matches('pagerduty resolve four').must.be.true();
            done();
        });
    });

    describe('oncall', function()
    {
        it('has tests');
    });

    describe('rotation', function()
    {
        it('has tests');
    });
});
