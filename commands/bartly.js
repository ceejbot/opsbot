// answer questions about BART trains
// You can get a BART api key at:
// http://www.bart.gov/schedules/developers/api

var
	_      = require('lodash'),
	assert = require('assert'),
	bole   = require('bole'),
	bart   = require('working-bart'),
	moment = require('moment')
	;

var gBart;

function builder(yargs)
{
	return yargs
		.example('bart next', 'the next trains to arrive at the default station')
		.example('bart show 19th', 'next trains to arrive at 19th street')
		.example('bart from 19th mlbr', 'next train to arrive at 19th going to Millbrae')
		.example('bart stations', 'list all bart station abbreviations')
		.usage('Name all stations using BART\'s four-letter abbreviations: <http://api.bart.gov/docs/overview/abbrev.aspx>')
	;
}

function handler(argv)
{
	if (!gBart)
		gBart = new BARTPlugin(argv.config.plugins.bartly);

	console.log(Object.keys(argv));
	console.log(argv.command);

	switch (argv.command)
	{
	case 'next':
		gBart.byStation(argv, gBart.defaultStation);
		break;

	case 'show':
		gBart.byStation(argv, argv.station.toLowerCase());
		break;

	case 'from':
		gBart.byStationDestination(argv, argv.station.toLowerCase(), argv.destination.toLowerCase());
		break;

	case 'stations':
		argv.reply(gBart.emitStations());
		break;

	default:
		argv.reply('Did you understand that last announcement?');
		break;
	}
}

module.exports = {
	command: 'bart <command> [station] [destination]',
	aliases: ['BART', 'Bart'],
	describe: 'answer questions about BART trains',
	builder: builder,
	handler: handler
};

// ----------------------------------------------------------------------

function BARTPlugin(opts)
{
	console.log(opts);
	assert(opts && _.isObject(opts), 'you must pass an options object');
	assert(opts.apikey && _.isString(opts.apikey), 'you must pass an `apikey` option');
	assert(opts.tzOffset && _.isNumber(opts.tzOffset), 'you must pass a `tzOffset` option');

	this.apikey = opts.apikey;
	this.defaultStation = (opts.station || '19th').toLowerCase();
	this.tzOffset = opts.tzOffset;
	this.log = bole('BART');
}

BARTPlugin.prototype.stations =
{
	'12th': '12th St. Oakland City Center',
	'16th': '16th St. Mission (SF)',
	'19th': '19th St. Oakland',
	'24th': '24th St. Mission (SF)',
	ashb:   'Ashby (Berkeley)',
	balb:   'Balboa Park (SF)',
	bayf:   'Bay Fair (San Leandro)',
	cast:   'Castro Valley',
	civc:   'Civic Center (SF)',
	cols:   'Coliseum/Oakland Airport',
	colm:   'Colma',
	conc:   'Concord',
	daly:   'Daly City',
	dbrk:   'Downtown Berkeley',
	dubl:   'Dublin/Pleasanton',
	deln:   'El Cerrito del Norte',
	plza:   'El Cerrito Plaza',
	embr:   'Embarcadero (SF)',
	frmt:   'Fremont',
	ftvl:   'Fruitvale (Oakland)',
	glen:   'Glen Park (SF)',
	hayw:   'Hayward',
	lafy:   'Lafayette',
	lake:   'Lake Merritt (Oakland)',
	mcar:   'MacArthur (Oakland)',
	mlbr:   'Millbrae',
	mont:   'Montgomery St. (SF)',
	nbrk:   'North Berkeley',
	ncon:   'North Concord/Martinez',
	orin:   'Orinda',
	pitt:   'Pittsburg/Bay Point',
	phil:   'Pleasant Hill',
	powl:   'Powell St. (SF)',
	rich:   'Richmond',
	rock:   'Rockridge (Oakland)',
	sbrn:   'San Bruno',
	sfia:   'San Francisco Int\'l Airport',
	sanl:   'San Leandro',
	shay:   'South Hayward',
	ssan:   'South San Francisco',
	ucty:   'Union City',
	wcrk:   'Walnut Creek',
	wdub:   'West Dublin',
	woak:   'West Oakland',
};

BARTPlugin.prototype.validStation = function validStation(station)
{
	return (Object.keys(this.stations).indexOf(station) > -1);
};

BARTPlugin.prototype.emitStations = function emitStations()
{
	var result = 'BART station abbreviations:\n' + _.map(this.stations, function(v, k)
	{
		return k + ': ' + v;
	}).join('\n');

	return result;
};

BARTPlugin.prototype.byStation = function byStation(message, station)
{
	if (!this.validStation(station))
	{
		message.reply(station + ' is not a valid BART station abbreviation.');
		message.reply(this.emitStations());
		return;
	}

	var self = this;
	var client = bart.createClient({ apiKey: this.apikey });

	function respond(estimates)
	{
		estimates = _.sortBy(estimates, 'minutes');
		var result = _.map(estimates, function(e)
		{
			var dep = moment().zone(self.tzOffset).add('m', e.minutes);
			return e.destination + ': ' + e.minutes + ' minutes @ ' + dep.format('h:mm a');
		});

		if (result.length > 0)
		{
			message.reply('Trains leaving ' + self.stations[station] + ':\n' + result.join('\n'));
			client.emitter.removeListener(station, respond);
		}
	}

	client.on(station, respond);
};

BARTPlugin.prototype.byStationDestination = function byStationDestination(message, station, dest)
{
	var self = this;
	var fullDest = this.stations[dest.toLowerCase()];
	var client = bart.createClient({ apiKey: this.apikey });

	function respond(estimates)
	{
		estimates = _.sortBy(estimates, 'minutes');
		var filtered = _.filter(estimates, { abbreviation: dest });

		if (filtered.length < 1)
		{
			message.reply('No trains found. You must pick an end-of-line station as a destination.');
		}
		else
		{
			var result = _.map(filtered, function(e)
			{
				var dep = moment().zone(self.tzOffset).add('m', e.minutes);
				return e.minutes + ' minutes @ ' + dep.format('h:mm a');
			});
			message.reply('Trains leaving ' + self.stations[station] + ' for ' + fullDest + ':\n' + result.join('\n'));
		}

		client.emitter.removeListener(station, respond);
	}

	client.on(station, respond);
};
