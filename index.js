require('dotenv').config();
var
	assert       = require('assert'),
	bole         = require('bole'),
	Slack        = require('@slack/client'),
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

	this.createParser();

	this.slack = new Slack.RtmClient(process.env.SLACK_TOKEN, { logLevel: 'warn' });
	this.slack.on(RTM_EVENTS.MESSAGE, this.handleMessage.bind(this));
};

Opsbot.prototype.createParser = function createParser()
{
	const parser = require('yargs')
		.usage(this.botname + ' [command]')
		.commandDir('commands')
		.help()
		.epilog('everything is exciting.');

	parser.showHelp();

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
			slack: this.slack,
			logger: this.logger,
			config: this.config,
		},  message);
		context.reply = makeReplier(context);

		self.parser.parse(message.text, context, function handled(err, argv, output)
		{
			console.log(argv);
			console.log(output);
			if (err) self.logger.error(err.message);
			else self.logger.info('I think it went okay?');
		});
	}
};

function makeReplier(context)
{
	return function replier(payload)
	{
		var textbit = typeof payload === 'string' ? payload : payload.text;
		context.slack.sendMessage(textbit, context.channel, function(err, msg)
		{
			if (err) context.logger.error(err);
			else
			{
				context.logger.info(msg);
				if (typeof payload === 'object' && payload.attachments)
				{
					msg.opts = { attachments: payload.attachments };
					context.slack.updateMessage(msg, function(err, msg2)
					{
						if (err) context.logger.error(err);
					});
				}
			}
		});
	};
}
