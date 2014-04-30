'use strict';

var
    lab         = require('lab'),
    describe    = lab.describe,
    it          = lab.it,
    demand      = require('must'),
    MockLogger  = require('./mocks/logger'),
    spawn       = require('./mocks/spawn'),
    MockMessage = require('./mocks/message'),
    Deployer    = require('../plugins/deployer');

describe('deployer', function()
{
    var plugin;

    lab.beforeEach(function(done)
    {
        plugin = new Deployer({
            log: new MockLogger(),
            spawn: spawn
        });
        done();
    });

    it('can be constructed', function(done)
    {
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
        var help = plugin.help();
        help.must.be.a.string();
        help.length.must.be.above(0);
        done();
    });

    it('implements matches() correctly', function(done)
    {
        plugin.matches('NOT MATCH').must.be.false();
        plugin.matches('deployer production').must.be.true();
        done();
    });

    it('implements respond() correctly', { timeout: 6000 }, function(done)
    {
        var msg = new MockMessage({text: 'npm semver'});
        msg.on('done', function() {  });
        plugin.respond(msg);
    });
});
