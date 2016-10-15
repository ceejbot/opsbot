require('dotenv').config();
var
	bole         = require('bole'),
	Message      = require('./lib/message'),
	Responder    = require('./lib/responder'),
	Slack        = require('@slack/client'),
	SLACK_EVENTS = Slack.CLIENT_EVENTS.RTM,
	RTM_EVENTS   = Slack.RTM_EVENTS
	;

var Opsbot = module.exports = function Opsbot(config)
{

	config = config || {};
	this.adminChannel = config.admin_channel;
	this.logger = bole('shell');
	this.responder = new Responder(config);
	this.botname = config.botname || 'opsbot';
	this.pattern = new RegExp('^' + this.botname + '(:\\s+)');

	this.slack = new Slack.RtmClient(process.env.SLACK_TOKEN, { logLevel: 'warn' });
	this.slack.on(RTM_EVENTS.MESSAGE, this.handleMessage.bind(this));
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
		var opts = Object.assign({
			slack: self.slack,
			logger: bole('response'),
		}, message);

		var reply = new Message(opts);
		self.responder.handleMessage(reply);
	}
};
