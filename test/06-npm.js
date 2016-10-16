/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand = require('must'),
	npm = require('../commands/npm')
	// sinon  = require('sinon')
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
