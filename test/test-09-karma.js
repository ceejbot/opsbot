'use strict';

var
    lab         = require('lab'),
    describe    = lab.describe,
    it          = lab.it,
    demand      = require('must'),
    path        = require('path'),
    MockMessage = require('./mocks/message'),
    Brain       = require('../lib/brain'),
    Karma       = require('../plugins/karma.js')
    ;

describe('karma', function()
{
    var plugin, brain;

    lab.before(function(done)
    {
        brain = new Brain({ dbpath: path.join(__dirname, 'db')});
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

    lab.after(function(done)
    {
        brain.close(done);
    });

});
