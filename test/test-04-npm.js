'use strict';

var
    lab         = require('lab'),
    describe    = lab.describe,
    it          = lab.it,
    demand      = require('must'),
    MockLogger  = require('./mocks/logger'),
    MockMessage = require('./mocks/message'),
    NPM         = require('../plugins/npm')
    ;

describe('npm', function()
{
    var plugin;

    lab.beforeEach(function(done)
    {
        plugin = new NPM({ log: new MockLogger() });
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
        plugin.matches('NOT VALID').must.be.false();
        plugin.matches('npm adfasdfasdfasdf adsfa adsf').must.be.true();
        plugin.matches('npm request').must.be.true();
        plugin.matches('npm semver    ').must.be.true();
        done();
    });

    it('implements respond() correctly', { timeout: 4000 }, function(done)
    {
        var msg = new MockMessage({text: 'npm semver'});
        msg.on('done', function() { done(); });
        plugin.respond(msg);
    });

    it('can fetch package download stats', function(done)
    {
        plugin.getDownloadsFor('semver', function(err, downloads)
        {
            demand(err).be.falsy();
            downloads.must.be.an.object();
            downloads.must.have.property('last_week');
            downloads.must.have.property('last_month');
            downloads.last_month.must.be.a.number();
            done();
        });
    });

    it('responds with the help message when no package is specified', function(done)
    {
        var msg = new MockMessage({text: 'npm'});
        msg.on('done', function() { done(); });
        msg.on('send', function(response)
        {
            response.must.be.a.string();
        });
        plugin.respond(msg);
    });

    it('responds with a hash of package status data', { timeout: 4000 }, function(done)
    {
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
