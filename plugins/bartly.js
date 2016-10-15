// answer questions about BART trains
// You can get a BART api key at:
// http://www.bart.gov/schedules/developers/api

var
	_      = require('lodash'),
	assert = require('assert'),
	bart   = require('bart'),
	moment = require('moment')
	;

var BARTPlugin = module.exports = function BARTPlugin(opts)
{
	assert(opts && _.isObject(opts), 'you must pass an options object');
	assert(opts.apikey && _.isString(opts.apikey), 'you must pass an `apikey` option');
	assert(opts.tzOffset && _.isNumber(opts.tzOffset), 'you must pass a `tzOffset` option');

	this.apikey = opts.apikey;
	this.defaultStation = (opts.station || '12th').toLowerCase();
	this.tzOffset = opts.tzOffset;
	this.log = opts.log;
};

BARTPlugin.prototype.name = 'BART';
BARTPlugin.prototype.pattern = /bart(ly)?\s+(\w+)\s?(\w+)?$/;

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

BARTPlugin.prototype.matches = function matches(msg)
{
	return this.pattern.test(msg);
};

BARTPlugin.prototype.respond = function respond(message)
{
	var msg = message.text;
	var matches = msg.match(this.pattern);

	if (matches[2] === 'help')
		return message.done(this.help());

	if (matches[2] === 'next')
		return this.byStation(message, this.defaultStation);

	if (!matches[3])
		return this.byStation(message, matches[2].toLowerCase());

	this.byStationDestination(message, matches[2].toLowerCase(), matches[3].toUpperCase());
};

BARTPlugin.prototype.help = function help(msg)
{
	return 'answer questions about BART trains\n' +
		'`bart next` - the next trains to arrive at the default station\n' +
		'`bart [station]` - next trains to arrive at the named station\n' +
		'`bart [station] [destination]` - next trains to arrive at _station_ going to _dest_\n' +
		'Name all stations using BART\'s four-letter abbreviations: <http://api.bart.gov/docs/overview/abbrev.aspx>\n' +
		'\nDefault station is `' + this.defaultStation + '`.'
		;
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
		message.send(station + ' is not a valid BART station abbreviation.');
		message.send(this.emitStations());
		message.done();
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
			message.done('Trains leaving ' + self.stations[station] + ':\n' + result.join('\n'));
			client.removeListener(station, respond);
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
			message.done('No trains found. You must pick an end-of-line station as a destination.');
		}
		else
		{
			var result = _.map(filtered, function(e)
			{
				var dep = moment().zone(self.tzOffset).add('m', e.minutes);
				return e.minutes + ' minutes @ ' + dep.format('h:mm a');
			});
			message.done('Trains leaving ' + self.stations[station] + ' for ' + fullDest + ':\n' + result.join('\n'));
		}

		client.removeListener(station, respond);
	}

	client.on(station, respond);
};
