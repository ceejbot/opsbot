/*global describe:true, it:true, before:true, after:true, beforeEach: true */
'use strict';

var
	demand = require('must'),
	bartly = require('../commands/bartly'),
	sinon  = require('sinon')
	;

var mockConfig =  {
	plugins: { bartly:
	{
		apikey: 'MW9S-E7SL-26DU-VV8V', // This is the PUBLIC bart api key
		tzOffset: 420,
		station: '19th',
	}
}};

describe('bartly', function()
{
	it('is a yargs command', function()
	{
		bartly.must.be.an.object();
		bartly.must.have.property('command');
		bartly.command.must.be.a.string();
		bartly.must.have.property('describe');
		bartly.describe.must.be.a.string();
		bartly.must.have.property('builder');
		bartly.builder.must.be.a.function();
		bartly.must.have.property('handler');
		bartly.handler.must.be.a.function();
	});

	it('stations() replies with the stations list', function()
	{
		var argv = {
			command: 'stations',
			reply: sinon.spy(),
			config: mockConfig,
		};

		bartly.handler(argv);
		argv.reply.called.must.be.true();
		var response = argv.reply.lastCall.args[0];
		response.must.match(/^BART station abbreviations/);
		response.must.match(/woak: West Oakland/);
	});

	it('byStation() responds with help if an invalid station is requested', function()
	{
		var argv = {
			command: 'show',
			station: 'invalid',
			reply: sinon.spy(),
			config: mockConfig,
		};

		bartly.handler(argv);
		argv.reply.called.must.be.true();
		var response = argv.reply.firstCall.args[0];
		response.must.match(/^invalid is not a valid BART station abbreviation/);
	});

	it('byStationDestination() responds with help if an invalid station is requested', function()
	{
		var argv = {
			command: 'show',
			station: 'invalid',
			destination: 'mlbr',
			reply: sinon.spy(),
			config: mockConfig,
		};

		bartly.handler(argv);
		argv.reply.called.must.be.true();
		var response = argv.reply.firstCall.args[0];
		response.must.match(/^invalid is not a valid BART station abbreviation/);
	});
});
