/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand   = require('must'),
	path     = require('path'),
	rimraf   = require('rimraf'),
	Brain    = require('../lib/brain')
	;

var dbpath = path.join(__dirname, 'db');

describe('Brain', function()
{
	var brain;

	before(function(done)
	{
		brain = new Brain({ dbpath: dbpath });
		done();
	});

	it('requires an options object', function(done)
	{
		function shouldThrow() { return new Brain(); }
		shouldThrow.must.throw(/an options object/);
		done();
	});

	it('requires a dbpath option string', function(done)
	{
		function shouldThrow() { return new Brain({}); }
		shouldThrow.must.throw(/dbpath/);
		done();
	});

	it('can be constructed', function(done)
	{
		brain.must.be.an.object();
		brain.must.be.instanceof(Brain);
		done();
	});

	it('offers a `get` method', function(done)
	{
		brain.must.have.property('get');
		brain.get.must.be.a.function();
		done();
	});

	it('get() requires a string argument', function(done)
	{
		function shouldThrow() { return brain.get(); }
		shouldThrow.must.throw(/name/);
		done();
	});

	it('get() returns a level db instance', function(done)
	{
		var db = brain.get('test');
		db.must.be.truthy();
		db.must.be.an.object();
		db.must.have.property('sublevel');
		db.sublevel.must.be.a.function();
		db.must.have.property('createValueStream');
		db.createValueStream.must.be.a.function();
		done();
	});

	after(function(done)
	{
		brain.close(function()
		{
			rimraf(dbpath, done);
		});
	});
});
