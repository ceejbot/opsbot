/*
Keep track of karma.

<person>++  - adds a karma point
<person>--  - removes a karma point
karma: person - report
*/

/*
var
	_      = require('lodash'),
	assert = require('assert')
	;

var Karma = module.exports = function Karma(opts)
{
	assert(opts.brain, 'the karma plugin requires a brain for storage');

	this.brain = opts.brain;
};

Karma.prototype.name = 'karma';
Karma.prototype.brain = null;
Karma.prototype.pattern = /karma\s+(\w+)(\+\+|--)?|(\w+)(\+\+|--)/;

Karma.prototype.matches = function matches(msg)
{
	return this.pattern.test(msg);
};

Karma.prototype.respond = function respond(message)
{
	var matches = message.text.match(this.pattern);

	if (matches[1] === 'help') return message.done(this.help());
	if (matches[1] === 'all') return this.reportAll(message);

	var target = matches[1] || matches[3];
	var action = matches[2] || matches[4];

	if (!action)
		return this.report(target, message);

	if (action === '++')
		return this.give(target, message);

	if (action === '--')
		return this.take(target, message);

	message.done(this.help());
};

Karma.prototype.reportAll = function reportAll(message)
{
	this.brain.createReadStream()
	.on('data', function(data)
	{
		message.send(reportMessage(data.key, data.value));
	})
	.on('error', function(err)
	{
		message.send('Error fetching karma: ' + err.message);
	})
	.on('end', function() { message.done(); });
};

function reportMessage(target, karma)
{
	return target + ' has ' + karma.score + ' karma.';
}

Karma.prototype.report = function report(target, message)
{
	this.brain.get(target, function(err, karma)
	{
		if (err && (err.name === 'NotFoundError'))
			return message.done(target + ' has no karma at all.');

		if (err) return message.done('There was an error fetching karma: ' + err.message);

		message.done(reportMessage(target, karma));
	});
};

Karma.prototype.give = function give(target, message)
{
	var self = this;
	this.brain.get(target, function(ignored, karma)
	{
		if (!karma) karma = {}; // we ignore not found errors
		if (_.isUndefined(karma.score)) karma.score = 0;

		karma.score++;

		self.brain.put(target, karma, function(err)
		{
			if (err) return message.done('There was an error storing karma: ' + err.message);

			message.send('Gave a karma point to ' + target + '!\n' + reportMessage(target, karma));
			message.done();
		});
	});
};

// TODO refactor common code out
Karma.prototype.take = function take(target, message)
{
	var self = this;
	this.brain.get(target, function(ignored, karma)
	{
		if (!karma) karma = {}; // we ignore not found errors
		if (_.isUndefined(karma.score)) karma.score = 0;

		karma.score--;

		self.brain.put(target, karma, function(err)
		{
			if (err) return message.done('There was an error storing karma: ' + err.message);

			message.send('Took a karma point from ' + target + '.\n' + reportMessage(target, karma));
			message.done();
		});
	});
};

Karma.prototype.help = function help()
{
	return 'Keep track of karma.\n' +
	'`person++`  - adds a karma point\n' +
	'`person--`  - removes a karma point\n' +
	'`karma [person]` - report current karma points for _person_\n' +
	'`karma all` - report everybody\'s karma';
};

*/

function builder(yargs) {}

function handler(argv)
{
	argv.reply('(╯°□°）╯︵ ');
}

module.exports = {
	command: 'karma give <person>',
	describe: 'not yet implemented',
	builder: builder,
	handler: handler
};
