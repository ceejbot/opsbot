/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand      = require('must'),
	MockMessage = require('./mocks/message'),
	StatusCats  = require('../plugins/statuscats')
	;

describe('StatusCats', function()
{
	it('can be constructed', function(done)
	{
		var plugin = new StatusCats();
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
		var plugin = new StatusCats();
		var help = plugin.help();
		help.must.be.a.string();
		help.length.must.be.above(0);
		done();
	});

	it('implements matches() correctly', function(done)
	{
		var plugin = new StatusCats();
		plugin.matches('NOT VALID').must.be.false();
		plugin.matches('statuscat').must.be.true();
		plugin.matches('statuscat 404').must.be.true();
		plugin.matches('statuscat 404    ').must.be.true();
		done();
	});

	it('implements respond() correctly', function(done)
	{
		var plugin = new StatusCats();

		var msg = new MockMessage({text: 'statuscat 503'});
		msg.on('send', function(response)
		{
			response.must.be.a.string();
			response.must.match('httpcats.herokuapp.com/503');
		});
		msg.on('done', function() { done(); });
		plugin.respond(msg);
	});

	it('responds with the help message for malformed statuses', function(done)
	{
		var plugin = new StatusCats();
		var msg = new MockMessage({text: 'statuscat asdf'});

		msg.on('send', function(help)
		{
			help.must.be.a.string();
			help.length.must.be.above(0);
		});
		msg.on('done', function() { done(); });
		plugin.respond(msg);
	});

	it('responds with a status cat url', function(done)
	{
		var plugin = new StatusCats();
		var msg = new MockMessage({text: 'statuscat 404'});

		msg.on('send', function(response)
		{
			response.must.be.an.string();
			response.must.match('httpcats.herokuapp.com/404');
		});
		msg.on('done', function() { done(); });
		plugin.respond(msg);
	});
});
