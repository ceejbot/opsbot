/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand     = require('must'),
	MockLogger = require('./mocks/logger'),
	net        = require('net'),
	Opsbot     = require('../lib/server'),
	Request    = require('request')
	;

describe('server', function()
{
	var mockopts = {
		listen  : 3000,
		log     : new MockLogger(),
		botname : 'test',
		token   : 'testtoken',
	};

	describe('constructor', function()
	{
		it('requires a config option', function(done)
		{
			function shouldThrow() { return new Opsbot(); }
			shouldThrow.must.throw(/opts/);
			done();
		});

		it('requires a listen port', function(done)
		{
			function shouldThrow() { return new Opsbot({}); }
			shouldThrow.must.throw(/listen/);
			done();
		});

		it('can be constructed', function(done)
		{
			var bot = new Opsbot(mockopts);
			bot.must.be.an.object();
			bot.must.be.instanceof(Opsbot);
			done();
		});

		it('respects its options', function(done)
		{
			var bot = new Opsbot(mockopts);

			bot.must.have.property('options');
			bot.options.must.be.an.object();
			bot.options.must.have.property('listen');
			bot.options.listen.must.equal(3000);

			done();
		});
	});

	describe('routes', function()
	{
		var bot;

		before(function(done)
		{
			bot = new Opsbot(mockopts);
			bot.listen(done);
		});

		it('listens on the specified port', function(done)
		{
			var client = net.connect({ port: 3000 }, function()
			{
				client.end();
				done();
			});
		});

		it('responds to GET /ping', function(done)
		{
			Request.get('http://localhost:3000/ping', { json: true }, function(err, res, body)
			{
				demand(err).not.exist();
				res.statusCode.must.equal(200);
				body.must.be.a.string();
				body.must.equal('pong');
				done();
			});
		});

		it('requires a valid token for /message', function(done)
		{
			var opts = {
				uri: 'http://localhost:3000/message',
				method: 'POST',
				json: { message: 'test', token: 'testtoken' }
			};

			Request(opts, function(err, res, body)
			{
				demand(err).not.exist();
				res.statusCode.must.equal(200);
				done();
			});
		});

		it('responds to POST /message', function(done)
		{
			var opts = {
				uri: 'http://localhost:3000/message',
				method: 'POST',
				json: { message: 'test', token: 'testtoken' }
			};

			Request(opts, function(err, res, body)
			{
				demand(err).not.exist();
				res.statusCode.must.equal(200);
				done();
			});
		});

		after(function(done)
		{
			bot.close(done);
		});
	});

	describe('responding', function()
	{
		it('posts responses to the provided webhook');
		it('does not leak messages or other objects per request');
	});
});
