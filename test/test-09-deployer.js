'use strict';

var
    demand      = require('must'),
    MockLogger  = require('./mocks/logger'),
    spawn       = require('./mocks/spawn'),
    MockMessage = require('./mocks/message'),
    Deployer    = require('../plugins/deployer');

describe('deployer', function()
{
    var plugin;

    beforeEach(function(done)
    {
        plugin = new Deployer({
            log: new MockLogger(),
            spawn: spawn,
            ansible: '/path/to/ansible-playbook',
            configdir: '/path/to/ansible/yml',
            playbooks:
            {
                www: './playbooks/www.yml',
                another:  './playbooks/deploy-another.yml'
            },
            environments: ['production', 'staging', 'development']
        });
        done();
    });

    describe('construction & configuration', function()
    {
        it('requires an options object', function(done)
        {
            function shouldThrow() { return new Deployer(); }
            shouldThrow.must.throw(/options object/);
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

        it('defaults spawn to child_process.spawn() if no spawn is provided', { timeout: 6000}, function(done) {
            plugin = new Deployer({
                log: new MockLogger(),
                ansible: '/path/to/ansible-playbook',
                configdir: '/path/to/ansible/yml',
                playbooks:
                {
                    www: './playbooks/www.yml',
                    another:  './playbooks/deploy-another.yml'
                },
                environments: ['production', 'staging', 'development']
            });
            plugin.spawn.must.be.a.function();
            done();
        });
    });

    describe('help', function()
    {
        it('implements help() correctly', function(done)
        {
            var help = plugin.help();
            help.must.be.a.string();
            help.length.must.be.above(0);
            done();
        });
    });

    describe('parsing', function()
    {
        it('implements matches() correctly', function(done)
        {
            plugin.matches('NOT MATCH').must.be.false();
            plugin.matches('deploy').must.be.true();
            plugin.matches('deploy help').must.be.true();
            plugin.matches('deploy www to production').must.be.true();
            plugin.matches('deploy www production').must.be.true();
            plugin.matches('deploy www production snorkle').must.be.true();
            plugin.matches('deploy www to production from snorkle').must.be.true();
            done();
        });

        it('the parser explodes invalid commands to a help command', function(done)
        {
            var parsed = plugin.parse('deploy');
            parsed.must.be.an.object();
            parsed.must.have.property('action');
            parsed.action.must.equal('help');

            done();
        });

        it('the parser explodes script/inventory as expected', function(done)
        {
            var parsed = plugin.parse('deploy www to production');
            parsed.action.must.equal('deploy');
            parsed.script.must.equal('www');
            parsed.environment.must.equal('production');
            parsed.branch.must.equal('HEAD');

            parsed = plugin.parse('deploy www production');
            parsed.script.must.equal('www');
            parsed.environment.must.equal('production');

            done();
        });

        it('the pattern explodes script/inventory/branch as expected', function(done)
        {
            var parsed = plugin.parse('deploy www to production from snorkle');
            parsed.action.must.equal('deploy');
            parsed.script.must.equal('www');
            parsed.environment.must.equal('production');
            parsed.branch.must.equal('snorkle');

            parsed = plugin.parse('deploy www production snorkle');
            parsed.script.must.equal('www');
            parsed.environment.must.equal('production');
            parsed.branch.must.equal('snorkle');

            done();
        });

        it('the pattern handles input with non-word characters', function(done)
        {
            var parsed = plugin.parse('deploy add-ssh-keys to production from ceej/test');
            parsed.action.must.equal('deploy');
            parsed.script.must.equal('add-ssh-keys');
            parsed.environment.must.equal('production');
            parsed.branch.must.equal('ceej/test');

            done();
        });
    });

    describe('reponder', function()
    {
        it('calls done() if no environment is provided to respond()', { timeout: 6000 }, function(done)
        {
            var msg = new MockMessage({text: 'ansible'});
            msg.on('done', function() { done(); });
            plugin.respond(msg);
        });

        it('calls done() if an environment is provided to respond()', { timeout: 6000 }, function(done)
        {
            var msg = new MockMessage({text: 'deploy development'});
            msg.on('done', function() { done(); });
            plugin.respond(msg);
        });

        it('calls done() if no environment is provided to respond()', { timeout: 6000 }, function(done)
        {
            var msg = new MockMessage({text: 'deploy'});
            msg.on('done', function() { done(); });
            plugin.respond(msg);
        });

        it('calls done() with help text if the command parses to `help`', function(done)
        {
            var msg = new MockMessage({text: 'deploy snozzles'});
            msg.on('send', function(msg)
            {
                var lines = msg.split('\n');
                lines.length.must.be.above(1);
                lines[0].must.equal('Run an ansible playbook for a specific inventory');
            });
            msg.on('done', function() { done(); });

            plugin.respond(msg);

        });
    });
});
