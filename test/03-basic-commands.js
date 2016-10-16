/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand     = require('must'),
	flip       = require('../commands/flip'),
	levenmorph = require('../commands/levenmorph'),
	rageflip   = require('../commands/rageflip'),
	statuscats = require('../commands/statuscats'),
	statusdogs = require('../commands/statusdogs'),
	sinon      = require('sinon')
	;

describe('simple plugins', function()
{
	describe('flip', function()
	{
		it('is a yargs command', function()
		{
			flip.must.be.an.object();
			flip.must.have.property('command');
			flip.command.must.be.a.string();
			flip.must.have.property('describe');
			flip.describe.must.be.a.string();
			flip.must.have.property('builder');
			flip.builder.must.be.a.function();
			flip.must.have.property('handler');
			flip.handler.must.be.a.function();
		});

		it('replies with flipped text', function()
		{
			var argv = {
				text: ['cat'],
				reply: sinon.spy(),
			};

			flip.handler(argv);
			argv.reply.called.must.be.true();
			argv.reply.calledWith('(╯°□°）╯︵ ʇɐɔ').must.be.true();
		});

		it('flips the table if given no input', function()
		{
			var argv = {
				text: [''],
				reply: sinon.spy(),
			};

			flip.handler(argv);
			argv.reply.called.must.be.true();
			argv.reply.calledWith('(╯°□°）╯︵ ┻━┻').must.be.true();
		});
	});

	describe('levenmorph', function()
	{
		it('is a yargs command', function()
		{
			levenmorph.must.be.an.object();
			levenmorph.must.have.property('command');
			levenmorph.command.must.be.a.string();
			levenmorph.must.have.property('describe');
			levenmorph.describe.must.be.a.string();
			levenmorph.must.have.property('builder');
			levenmorph.builder.must.be.a.function();
			levenmorph.must.have.property('handler');
			levenmorph.handler.must.be.a.function();
		});

		it('replies with a morph chain', function()
		{
			var argv = {
				word1: 'java',
				word2: 'ruby',
				reply: sinon.spy(),
			};

			levenmorph.handler(argv);
			argv.reply.called.must.be.true();
			var response = argv.reply.lastCall.args[0];
			response.must.match(/^java/);
			response.must.match(/ruby$/);
		});

		it('says so when the morph is impossible', function()
		{
			var argv = {
				word1: 'supercalifragilistic',
				word2: 'expialidocious',
				reply: sinon.spy(),
			};

			levenmorph.handler(argv);
			argv.reply.called.must.be.true();
			var response = argv.reply.lastCall.args[0];
			response.must.match(/^cannot morph/);
		});
	});

	describe('rageflip', function()
	{
		it('is a yargs command', function()
		{
			rageflip.must.be.an.object();
			rageflip.must.have.property('command');
			rageflip.command.must.be.a.string();
			rageflip.must.have.property('describe');
			rageflip.describe.must.be.a.string();
			rageflip.must.have.property('builder');
			rageflip.builder.must.be.a.function();
			rageflip.must.have.property('handler');
			rageflip.handler.must.be.a.function();
		});

		it('replies with rage-y flipped text', function()
		{
			var argv = {
				text: ['cat'],
				reply: sinon.spy(),
			};

			rageflip.handler(argv);
			argv.reply.called.must.be.true();
			argv.reply.calledWith('(ノಠ益ಠ)ノ彡 ʇɐɔ').must.be.true();
		});

		it('flips the table if given no input', function()
		{
			var argv = {
				text: [''],
				reply: sinon.spy(),
			};

			rageflip.handler(argv);
			argv.reply.called.must.be.true();
			argv.reply.calledWith('(ノಠ益ಠ)ノ彡 ┻━┻').must.be.true();
		});
	});

	describe('statuscats', function()
	{
		it('is a yargs command', function()
		{
			statuscats.must.be.an.object();
			statuscats.must.have.property('command');
			statuscats.command.must.be.a.string();
			statuscats.must.have.property('describe');
			statuscats.describe.must.be.a.string();
			statuscats.must.have.property('builder');
			statuscats.builder.must.be.a.function();
			statuscats.must.have.property('handler');
			statuscats.handler.must.be.a.function();
		});

		it('responds with a url', function()
		{
			var argv = {
				code: '200',
				reply: sinon.spy(),
			};

			statuscats.handler(argv);
			argv.reply.called.must.be.true();
			argv.reply.calledWith('http://http.cat/200.jpg').must.be.true();
		});
	});

	describe('statusdogs', function()
	{
		it('is a yargs command', function()
		{
			statusdogs.must.be.an.object();
			statusdogs.must.have.property('command');
			statusdogs.command.must.be.a.string();
			statusdogs.must.have.property('describe');
			statusdogs.describe.must.be.a.string();
			statusdogs.must.have.property('builder');
			statusdogs.builder.must.be.a.function();
			statusdogs.must.have.property('handler');
			statusdogs.handler.must.be.a.function();
		});

		it('responds with a url', function()
		{
			var argv = {
				code: '200',
				reply: sinon.spy(),
			};

			statusdogs.handler(argv);
			argv.reply.called.must.be.true();
			argv.reply.calledWith('https://httpstatusdogs.com/200').must.be.true();
		});
	});
});
