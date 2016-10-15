/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand     = require('must'),
	Opsbot = require('../index')
	;

describe('rtm-client', function()
{
	var mockopts = {
		botname : 'test',
		admin_channel: 'foo'
	};

	describe('constructor', function()
	{
		it('can be constructed', function()
		{
			var bot = new Opsbot(mockopts);
			bot.must.be.an.object();
			bot.must.be.instanceof(Opsbot);
		});

		it('respects its options', function()
		{
			var bot = new Opsbot(mockopts);

			bot.must.have.property('adminChannel');
			bot.adminChannel.must.equal(mockopts.admin_channel);
			bot.must.have.property('botname');
			bot.botname.must.equal(mockopts.botname);
			bot.must.have.property('slack');

		});
	});
});
