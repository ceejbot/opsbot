'use strict';

var
    lab         = require('lab'),
    describe    = lab.describe,
    it          = lab.it,
    demand      = require('must'),
    path        = require('path'),
    rimraf      = require('rimraf'),
    MockMessage = require('./mocks/message'),
    Brain       = require('../lib/brain'),
    Karma       = require('../plugins/karma.js')
    ;

var dbpath = path.join(__dirname, 'db');

describe('karma', function()
{
    var plugin, brain;

    lab.before(function(done)
    {
        brain = new Brain({ dbpath: dbpath });
        plugin = new Karma({ brain: brain.get('karma') }); // what is brain?
        done();
    });

    it('demands a brain option', function(done)
    {
        function shouldThrow() { return new Karma(); }
        shouldThrow.must.throw(/brain/);
        done();
    });

    it('can be constructed', function(done)
    {
        var tmp = new Karma({ brain: brain });
        tmp.must.be.an.object();
        tmp.must.be.instanceof(Karma);
        done();
    });

    it('matches "karma help"', function(done)
    {
        plugin.matches('karma help').must.be.true();
        var matches = 'karma help'.match(plugin.pattern);
        matches[1].must.equal('help');
        done();
    });

    it('matches "karma harry"', function(done)
    {
        plugin.matches('karma harry').must.be.true();
        var matches = 'karma harry'.match(plugin.pattern);
        matches[1].must.equal('harry');
        done();
    });

    it('matches "harry++"', function(done)
    {
        plugin.matches('harry++').must.be.true();
        var matches = 'harry++'.match(plugin.pattern);
        matches[3].must.equal('harry');
        matches[4].must.equal('++');
        done();
    });

    it('matches "ron--"', function(done)
    {
        plugin.matches('ron--').must.be.true();
        var matches = 'ron--'.match(plugin.pattern);
        matches[3].must.equal('ron');
        matches[4].must.equal('--');
        done();
    });

    it('matches "karma harry++"', function(done)
    {
        plugin.matches('karma harry++').must.be.true();
        var matches = 'karma harry++'.match(plugin.pattern);
        matches[1].must.equal('harry');
        matches[2].must.equal('++');
        done();
    });

    it('matches "karma ron--"', function(done)
    {
        plugin.matches('karma ron--').must.be.true();
        var matches = 'karma ron--'.match(plugin.pattern);
        matches[1].must.equal('ron');
        matches[2].must.equal('--');
        done();
    });

    it('implements help() correctly', function(done)
    {
        var help = plugin.help();
        help.must.be.a.string();
        help.length.must.be.above(0);
        done();
    });

    it('responds to help', function(done)
    {
        var msg = new MockMessage({text: 'karma help'});
        msg.on('send', function(text)
        {
            text.must.be.a.string();
            text.length.must.be.above(0);
        });
        msg.on('done', function() { done(); });

        plugin.respond(msg);
    });

    it('give() adds a karma point to the target', function(done)
    {
        var msg = new MockMessage({text: 'harry++'});
        msg.on('send', function(msg)
        {
            msg.must.match(/harry/);
            if (msg.match(/harry has/)) msg.must.match(/1 karma/);
        });
        msg.on('done', function() { done(); });

        plugin.respond(msg);
    });

    it('give() adds a karma point to a target who already has points', function(done)
    {
        var msg = new MockMessage({text: 'harry++'});
        msg.on('send', function(msg)
        {
            msg.must.match(/harry/);
            if (msg.match(/harry has/)) msg.must.match(/2 karma/);
        });
        msg.on('done', function() { done(); });

        plugin.respond(msg);
    });

    it('take() remove a karma point from the target', function(done)
    {
        var msg = new MockMessage({text: 'ron--'});
        msg.on('send', function(msg)
        {
            msg.must.match(/ron/);
            if (msg.match(/ron has/)) msg.must.match(/\-1 karma/);
        });
        msg.on('done', function() { done(); });

        plugin.respond(msg);

    });

    it('take() removes a karma point from a target who already has points', function(done)
    {
        var msg = new MockMessage({text: 'karma harry--'});
        msg.on('send', function(msg)
        {
            msg.must.match(/harry/);
            if (msg.match(/harry has/)) msg.must.match(/1 karma/);
        });
        msg.on('done', function() { done(); });

        plugin.respond(msg);
    });

    it('report() handles the case of a new target', function(done)
    {
        var msg = new MockMessage({text: 'karma lupin'});
        msg.on('send', function(msg)
        {
            msg.must.match(/no karma/);
        });
        msg.on('done', function() { done(); });

        plugin.respond(msg);
    });

    it('report() responds with a string including the current karma', function(done)
    {
        var msg = new MockMessage({text: 'karma harry'});
        msg.on('send', function(msg)
        {
            msg.must.match(/harry/);
            msg.must.match(/1 karma/);
        });
        msg.on('done', function() { done(); });

        plugin.respond(msg);
    });

    it('reportAll() reports karma for all users', function(done)
    {
        var counter = 0;

        var msg = new MockMessage({text: 'karma all'});
        msg.on('send', function(msg)
        {
            counter++;
        });
        msg.on('done', function()
        {
            counter.must.equal(2);
            done();
        });

        plugin.respond(msg);
    });

    lab.after(function(done)
    {
        brain.close(function()
        {
            rimraf(dbpath, done);
        });
    });
});
