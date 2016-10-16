/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand = require('must'),
	npm = require('../commands/npm'),
	sinon  = require('sinon')
	;

describe('npm', function()
{
	it('is a yargs command', function()
	{
		npm.must.be.an.object();
		npm.must.have.property('command');
		npm.command.must.be.a.string();
		npm.must.have.property('describe');
		npm.describe.must.be.a.string();
		npm.must.have.property('builder');
		npm.builder.must.be.a.function();
		npm.must.have.property('handler');
		npm.handler.must.be.a.function();
	});

	it('fetches package info', function(done)
	{
		this.timeout(10000);

		function handleReply(reply)
		{
			reply.must.be.an.object();
			reply.must.have.property('text');
			reply.text.must.equal('tiny-tarball');
			done();
		}

		var argv = {
			command: 'view',
			package: 'tiny-tarball',
			reply: handleReply,
		};

		npm.packageInfo(argv);
	});

	it('fetches download stats', function(done)
	{
		this.timeout(10000);

		function handleReply(reply)
		{
			reply.must.be.a.string();
			reply.must.match(/^\*npm downloads by day:\*/);
			reply.split('\n').length.must.be.above(10);

			done();
		}

		var argv = {
			command: 'downloads',
			period: 'last-month',
			reply: handleReply,
		};

		npm.downloadStats(argv);
	});

	it('falls back to week if no period given', function(done)
	{
		this.timeout(10000);

		function handleReply(reply)
		{
			reply.must.be.a.string();
			reply.must.match(/^\*npm downloads by day:\*/);
			reply.split('\n').length.must.equal(10);
			done();
		}

		var argv = {
			command: 'downloads',
			reply: handleReply,
		};

		npm.downloadStats(argv);
	});
});
