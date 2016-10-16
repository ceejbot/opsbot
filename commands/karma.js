var
	_      = require('lodash'),
	Brain = require('../lib/brain')
	;

var gKarma = null;

function Karma(brain)
{
	var db = Brain.getGlobal();
	if (!db) return;
	this.brain = db.get('karma');
}

Karma.prototype.reportAll = function reportAll(message)
{
	if (!this.brain) return;

	this.brain.createReadStream()
	.on('data', function(data)
	{
		message.reply(reportMessage(data.key, data.value));
	})
	.on('error', function(err)
	{
		message.reply('Error fetching karma: ' + err.message);
	})
	.on('end', function()
	{
		message.reply('That is everybody I know about.');
	});
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
			return message.reply(target + ' has no karma at all.');

		if (err) return message.reply('There was an error fetching karma: ' + err.message);

		message.reply(reportMessage(target, karma));
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
			if (err) return message.reply('There was an error storing karma: ' + err.message);

			message.reply('Gave a karma point to ' + target + '!\n' + reportMessage(target, karma));
		});
	});
};

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
			if (err) return message.reply('There was an error storing karma: ' + err.message);

			message.reply('Took a karma point from ' + target + '.\n' + reportMessage(target, karma));
		});
	});
};

function builder(yargs)
{
	yargs
		.example('karma give harry', 'give karma to harry')
		.example('karma take voldemort', 'take karma from He Who Must Not Be Named')
		.example('karma show hermione', 'show how much karma hermione has (protip: a lot)')
		.example('karma all', 'show everybody\'s karma');

	return yargs;
}

function handler(argv)
{
	if (!gKarma) gKarma = new Karma();
	switch (argv.command)
	{
	case 'give':
		gKarma.give(argv.person, argv);
		break;

	case 'take':
		gKarma.take(argv.person, argv);
		break;

	case 'show':
		gKarma.report(argv.person, argv);
		break;

	case 'all':
		gKarma.reportAll(argv);
		break;

	default:
		argv.reply('Did you understand that last announcement?');
		// return help for command
	}
}

module.exports = {
	command: 'karma <command> [person]',
	describe: 'keep track of karma',
	builder: builder,
	handler: handler,
	Karma: Karma, // for testing
	global: function() { return gKarma; } // for testing
};
