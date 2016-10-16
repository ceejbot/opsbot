/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand = require('must'),
	karma = require('../commands/karma')
	// sinon  = require('sinon')
	;

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
	});

	it('has tests', function()
	{
		/*
		var argv = {
			text: ['cat'],
			reply: sinon.spy(),
		};

		flip.handler(argv);
		argv.reply.called.must.be.true();
		argv.reply.calledWith('(╯°□°）╯︵ ʇɐɔ').must.be.true();
		*/
	});
});
