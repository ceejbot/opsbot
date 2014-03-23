/*global describe:true, it:true, before:true, after:true */

var
    demand      = require('must'),
    MockMessage = require('./mocks/message'),
    NPM         = require('../plugins/npm')
    ;

describe('npm plugin', function()
{
    it('can be constructed', function()
    {
        var plugin = new NPM();
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
        var plugin = new NPM();
        var help = plugin.help();
        help.must.be.a.string();
        help.length.must.be.above(0);
    });

    it('implements matches() correctly', function()
    {
        var plugin = new NPM();
        plugin.matches('NOT VALID').must.be.false();
        plugin.matches('npm adfasdfasdfasdf adsfa adsf').must.be.true();
        plugin.matches('npm request').must.be.true();
        plugin.matches('npm semver    ').must.be.true();
    });

    it('implements respond() correctly', function(done)
    {
        var plugin = new NPM();
        var msg = new MockMessage({text: 'npm semver'});
        msg.on('done', function() { done(); });
        plugin.respond(msg);
    });

    it('responds with the help message when no package is specified', function(done)
    {
        var plugin = new NPM();
        var msg = new MockMessage({text: 'npm'});
        msg.on('done', function() { done(); });
        msg.on('send', function(response)
        {
            response.must.be.a.string();
        });
        plugin.respond(msg);
    });

    it('responds with a hash of package status data', function(done)
    {
        var plugin = new NPM();
        var msg = new MockMessage({text: 'npm semver'});
        msg.on('done', function() { done(); });
        msg.on('send', function(response)
        {
            response.must.be.an.object();
            response.must.have.property('text');
            response.must.have.property('attachments');
            response.attachments.must.be.an.array();
        });
        plugin.respond(msg);
    });
});
