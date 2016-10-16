require('dotenv').config();
var
	_            = require('lodash'),
	assert       = require('assert'),
	bole         = require('bole'),
	Brain        = require('./lib/brain'),
	fs           = require('fs'),
	path         = require('path'),
	Slack        = require('@slack/client'),
	tryrequire   = require('try-require'),
	SLACK_EVENTS = Slack.CLIENT_EVENTS.RTM,
	RTM_EVENTS   = Slack.RTM_EVENTS
	;

var Opsbot = module.exports = function Opsbot(config)
{
	assert(process.env.SLACK_TOKEN, 'you must put a slack bot api key in the SLACK_TOKEN env var');
	this.config = config || {};
	this.adminChannel = config.admin_channel;
	this.logger = bole('shell');
	this.botname = config.botname || 'opsbot';
	this.pattern = new RegExp('^' + this.botname + ':?\\s+');

	if (config.brain)
	{
		this.brain = new Brain(config.brain);
		Brain.setGlobal(this.brain);
	}

	this.createParser();

	this.slack = new Slack.RtmClient(process.env.SLACK_TOKEN, { logLevel: 'warn' });
	this.slack.on(RTM_EVENTS.MESSAGE, this.handleMessage.bind(this));
};

Opsbot.prototype.createParser = function createParser()
{
	var self = this;
	var commanddir = path.join(__dirname, 'commands');

	const parser = require('yargs')
		.usage(this.botname + ' [command]')
		.commandDir(commanddir)
		.demand(1)
		.help()
		.epilog('everything is exciting.');

	// now load additional commands
	var requested = Object.keys(this.config.plugins || {});

	// built-ins
	var files = fs.readdirSync(commanddir);
	var builtin = _.map(files, function(f)
	{
		if (f.endsWith('.js')) return f.replace(/.js$/, '');
	});
	var external = _.difference(requested, builtin);

	var hackpath = process.cwd() + '/node_modules/';
	_.each(external, function loadCommand(c)
	{
		var module = tryrequire(c);
		if (!module) module = tryrequire(hackpath + c);
		if (module) parser.command(module);
		else self.logger.info(`could not load plugin ${c}`);
	});

	this.parser = parser;
};

Opsbot.prototype.start = function start()
{
	var self = this;
	this.slack.start();
	this.slack.on(SLACK_EVENTS.RTM_CONNECTION_OPENED, function slackClientOpened()
	{
		self.logger.info('You may fire when ready.');
		if (self.adminChannel)
			self.slack.sendMessage(`${self.botname} coming online.`, self.adminChannel);
	});
};

Opsbot.prototype.handleMessage = function handleMessage(message)
{
	var self = this;

	if (!message.text || message.subtype === 'bot_message') return;
	if (this.pattern.test(message.text))
	{
		self.logger.info('responding', message);

		var context = Object.assign({
			logger: this.logger,
			config: this.config,
			brain: this.brain,
		},  message);
		context.reply = makeReplier(context, self.slack);
		var text = message.text.replace(this.pattern, '');

		self.parser.parse(text, context, function handled(err, argv, output)
		{
			if (err)
				self.logger.error(err.message);
			else if (output)
				self.slack.sendMessage(output, message.channel);
		});
	}
};

function makeReplier(context, slack)
{
	return function replier(payload)
	{
		var textbit = typeof payload === 'string' ? payload : payload.text;
		slack.sendMessage(textbit, context.channel, function(err, msg)
		{
			if (err) context.logger.error(err);
			else
			{
				context.logger.info(msg);
				if (typeof payload === 'object' && payload.attachments)
				{
					msg.opts = Object.assign({}, payload);
					slack.updateMessage(msg, function(err, msg2)
					{
						if (err) context.logger.error(err);
					});
				}
			}
		});
	};
}
