/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand      = require('must'),
	MockMessage = require('./mocks/message'),
	Morpher     = require('../plugins/levenmorph');

describe('levenmorpher', function()
{
	var plugin;

	before(function(done)
	{
		plugin = new Morpher();
		done();
	});

	it('can be constructed', function(done)
	{
		var tmp = new Morpher();
		tmp.must.be.an.object();
		tmp.must.be.instanceof(Morpher);
		done();
	});

	describe('help', function()
	{
		it('matches "morph help"', function(done)
		{
			plugin.matches('morph help').must.be.true();
			var matches = 'morph help'.match(plugin.pattern);
			matches[1].must.equal('help');
			done();
		});

		it('matches "levenmorph help"', function(done)
		{
			plugin.matches('levenmorph help').must.be.true();
			var matches = 'levenmorph help'.match(plugin.pattern);
			matches[1].must.equal('help');
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
			var msg = new MockMessage({text: 'morpher help'});
			msg.on('send', function(text)
			{
				text.must.be.a.string();
				text.length.must.be.above(0);
			});
			msg.on('done', function() { done(); });

			plugin.respond(msg);
		});
	});

	describe('word morphing', function()
	{
		it('matches "morph npm nom"', function(done)
		{
			plugin.matches('morph npm nom').must.be.true();
			var matches = 'morph npm nom'.match(plugin.pattern);
			matches[2].must.equal('npm');
			matches[3].must.equal('nom');
			done();
		});

		it('responds with the morph', function(done)
		{
			var msg = new MockMessage({text: 'morph npm nom'});
			msg.on('send', function(msg)
			{
				var lines = msg.split('\n');
				lines.length.must.equal(2);
				lines[0].must.equal('npm');
				lines[1].must.equal('nom');
			});
			msg.on('done', function() { done(); });

			plugin.respond(msg);
		});

		it('matches "morph cow to goat"', function(done)
		{
			plugin.matches('morph cow to goat').must.be.true();
			var matches = 'morph cow to goat'.match(plugin.pattern);
			matches[2].must.equal('cow');
			matches[3].must.equal('goat');
			done();
		});

		it('responds correctly to "levenmorph cow to goat"', function(done)
		{
			var msg = new MockMessage({text: 'levenmorph cow to goat'});
			msg.on('send', function(msg)
			{
				var lines = msg.split('\n');
				lines.length.must.equal(4);
				lines[0].must.equal('cow');
				lines[3].must.equal('goat');
			});
			msg.on('done', function() { done(); });

			plugin.respond(msg);
		});
	});
});
