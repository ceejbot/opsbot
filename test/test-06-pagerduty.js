/*global describe:true, it:true, before:true, after:true */

var
    demand    = require('must'),
    PagerDuty = require('../plugins/pagerduty')
    ;

describe('PagerDuty', function()
{
    var fakeopts = { apikey: 'foo', urlprefix: 'bar' };

    describe('plugin', function()
    {
        it('requires an options object', function()
        {
            function shouldThrow() { return new PagerDuty(); }
            shouldThrow.must.throw(/options object/);
        });

        it('requires a key option', function()
        {
            function shouldThrow() { return new PagerDuty({}); }
            shouldThrow.must.throw(/apikey/);
        });

        it('can be constructed', function()
        {
            var plugin = new PagerDuty(fakeopts);
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
            var plugin = new PagerDuty(fakeopts);
            var help = plugin.help();
            help.must.be.an.object();
            help.must.have.property('pagerduty');
            help.pagerduty.must.be.a.string();
        });

        it('implements matches() correctly', function()
        {
            var plugin = new PagerDuty(fakeopts);
            plugin.matches('NOT VALID').must.be.false();
            plugin.matches('pagerduty help').must.be.true();
            plugin.matches('pagerduty oncall').must.be.true();
            plugin.matches('pagerduty rotation    ').must.be.true();
        });

        it('implements respond() correctly', function(done)
        {
            var plugin = new PagerDuty(fakeopts);

            plugin.must.have.property('respondAsync');

            var reply = plugin.respondAsync('pagerduty asdf');
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

    describe('pagerduty oncall', function()
    {
        it('has tests');
    });

    describe('pagerduty rotation', function()
    {
        it('has tests');
    });


});
