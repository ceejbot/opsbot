// answer questions about Fastly status

var
    _      = require('lodash'),
    bart   = require('bart'),
    moment = require('moment')
    ;

var BARTPlugin = module.exports = function BARTPlugin(opts)
{
    this.apikey = opts.apikey;
    this.defaultStation = opts.station.toLowerCase() || '12th';
    this.log = opts.log;

    this.client = bart.createClient({ apiKey: opts.apikey });
};

BARTPlugin.prototype.name = 'BART';
BARTPlugin.prototype.pattern = /(.+)\s+(\w+)?$/;

BARTPlugin.prototype.stations =
{
    '12th':    '12th St. Oakland City Center',
    '16th':    '16th St. Mission (SF)',
    '19th':    '19th St. Oakland',
    '24th':    '24th St. Mission (SF)',
    'ashb':    'Ashby (Berkeley)',
    'balb':    'Balboa Park (SF)',
    'bayf':    'Bay Fair (San Leandro)',
    'cast':    'Castro Valley',
    'civc':    'Civic Center (SF)',
    'cols':    'Coliseum/Oakland Airport',
    'colm':    'Colma',
    'conc':    'Concord',
    'daly':    'Daly City',
    'dbrk':    'Downtown Berkeley',
    'dubl':    'Dublin/Pleasanton',
    'deln':    'El Cerrito del Norte',
    'plza':    'El Cerrito Plaza',
    'embr':    'Embarcadero (SF)',
    'frmt':    'Fremont',
    'ftvl':    'Fruitvale (Oakland)',
    'glen':    'Glen Park (SF)',
    'hayw':    'Hayward',
    'lafy':    'Lafayette',
    'lake':    'Lake Merritt (Oakland)',
    'mcar':    'MacArthur (Oakland)',
    'mlbr':    'Millbrae',
    'mont':    'Montgomery St. (SF)',
    'nbrk':    'North Berkeley',
    'ncon':    'North Concord/Martinez',
    'orin':    'Orinda',
    'pitt':    'Pittsburg/Bay Point',
    'phil':    'Pleasant Hill',
    'powl':    'Powell St. (SF)',
    'rich':    'Richmond',
    'rock':    'Rockridge (Oakland)',
    'sbrn':    'San Bruno',
    'sfia':    'San Francisco Int\'l Airport',
    'sanl':    'San Leandro',
    'shay':    'South Hayward',
    'ssan':    'South San Francisco',
    'ucty':    'Union City',
    'wcrk':    'Walnut Creek',
    'wdub':    'West Dublin',
    'woak':    'West Oakland',
};

BARTPlugin.prototype.matches = function matches(msg)
{
    return /^bart/.test(msg);
};

BARTPlugin.prototype.respond = function respond(message)
{
    var msg = message.text;
    msg = msg.replace(/^bart\s?/, '').trim();

    var commands = msg.split(/\s+/);

    switch (commands.length)
    {
    case 1:
        if (commands[0] === 'next') return this.byStation(message, this.defaultStation);
        return this.byStation(message, commands[0].toLowerCase());

    case 2:
        return this.byStationDestination(message, commands[0].toLowerCase(), commands[1].toUpperCase());
        break;

    default:
        message.done(this.help());
        break;
    }
};

BARTPlugin.prototype.help = function help(msg)
{
    return 'answer questions about BART trains\n' +
        'bart next: the next trains to arrive at the default station\n' +
        'bart <station>: next trains to arrive at the named station\n' +
        'bart <station> <destination>: next trains to arrive at station going to dest\n';
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
        message.done(this.emitStations());
        return;
    }

    var self = this;

    function respond(estimates)
    {
        estimates = _.sortBy(estimates, 'minutes');
        var result = _.map(estimates, function(e)
        {
            var dep = moment().add('m', e.minutes);
            return e.destination + ': ' + e.minutes + ' minutes @ ' + dep.format('h:mm a');
        });

        if (result.length)
        {
            message.done('Trains leaving ' + self.stations[station] + ':\n' + result.join('\n'));
            self.client.removeListener(station, respond);
        }
    }

    this.client.on(station, respond);
};

BARTPlugin.prototype.byStationDestination = function byStationDestination(message, station, dest)
{
    var self = this;
    var fullDest, fullStart;

    function respond(estimates)
    {
        estimates = _.sortBy(estimates, 'minutes');
        var filtered = _.filter(estimates, { abbreviation: dest });
        var result = _.map(filtered, function(e)
        {
            if (!fullDest) fullDest = e.destination;
            var dep = moment().add('m', e.minutes);
            return e.minutes + ' minutes @ ' + dep.format('h:mm a');
        });

      message.done('Trains leaving ' + self.stations[station] + ' for ' + fullDest + ':\n' + result.join('\n'));
      self.client.removeListener(station, respond);
    }

    this.client.on(station, respond);
};

