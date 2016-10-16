/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand = require('must'),
	karma = require('../commands/karma'),
	sinon  = require('sinon')
	;

function createMockDB()
{
	var selfer = sinon.mock();
	selfer.returns(selfer);

	var mock = {
		createReadStream: sinon.mock().returns({ on: selfer }),
		get: sinon.mock().yields(null, { score: 0 }),
		put: sinon.mock().yields(null),
	};

	return mock;
}

describe('karma', function()
{
	it('is a yargs command', function()
	{
		karma.must.be.an.object();
		karma.must.have.property('command');
		karma.command.must.be.a.string();
		karma.must.have.property('describe');
		karma.describe.must.be.a.string();
		karma.must.have.property('builder');
		karma.builder.must.be.a.function();
		karma.must.have.property('handler');
		karma.handler.must.be.a.function();

		karma.must.have.property('Karma');
		karma.Karma.must.be.a.function();
	});

	it('Karma must be constructable', function()
	{
		var obj = new karma.Karma();
		obj.must.be.instanceof(karma.Karma);
		obj.reportAll.must.be.a.function();
		obj.report.must.be.a.function();
		obj.give.must.be.a.function();
		obj.take.must.be.a.function();
	});

	it('responds with help when confused', function()
	{
		var argv = {
			command: 'help',
			reply: sinon.spy(),
		};

		karma.handler(argv);
		argv.reply.called.must.be.true();
		argv.reply.calledWith('Did you understand that last announcement?').must.be.true();
	});

	it('`all` streams all keys', function()
	{
		var argv = {
			command: 'all',
			reply: sinon.spy(),
		};
		var plugin = karma.global();
		plugin.brain = createMockDB();

		karma.handler(argv);
		plugin.brain.createReadStream.called.must.be.true();
	});

	it('`give` adds karma', function(done)
	{
		function noteReply(message)
		{
			plugin.brain.get.called.must.be.true();
			plugin.brain.get.calledWith('test').must.be.true();
			plugin.brain.put.calledWith('test', {score: 1 }).must.be.true();
			done();
		}

		var argv = {
			command: 'give',
			person: 'test',
			reply: noteReply,
		};
		var plugin = karma.global();
		plugin.brain = createMockDB();

		karma.handler(argv);
	});

	it('`take` removes karma', function(done)
	{
		function noteReply(message)
		{
			plugin.brain.get.called.must.be.true();
			plugin.brain.get.calledWith('test').must.be.true();
			plugin.brain.put.calledWith('test', {score: -1 }).must.be.true();
			done();
		}

		var argv = {
			command: 'take',
			person: 'test',
			reply: noteReply,
		};
		var plugin = karma.global();
		plugin.brain = createMockDB();

		karma.handler(argv);
		plugin.brain.get.called.must.be.true();
		plugin.brain.get.calledWith('test').must.be.true();
	});

	it('`show` shows karma for a person', function(done)
	{
		function noteReply(message)
		{
			plugin.brain.get.called.must.be.true();
			plugin.brain.get.calledWith('test').must.be.true();
			message.must.equal('test has 0 karma.');
			done();
		}

		var argv = {
			command: 'show',
			person: 'test',
			reply: noteReply,
		};
		var plugin = karma.global();
		plugin.brain = createMockDB();

		karma.handler(argv);
		plugin.brain.get.called.must.be.true();
	});
});
