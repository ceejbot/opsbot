var
	_         = require('lodash'),
	assert    = require('assert'),
	bole      = require('bole'),
	Message   = require('./message'),
	Responder = require('./responder'),
	restify   = require('restify')
	;

var Opsbot = module.exports = function Opsbot(opts)
{
	assert(opts && _.isObject(opts), 'you must pass an opts argument to Opsbot');
	assert(opts.listen && _.isNumber(opts.listen), 'you must pass a listen port in `opts.listen`');

	this.options = opts;
	this.log = bole('responder');

	this.responder = new Responder(opts);

	var restifyOpts = {};
	var server = restify.createServer(restifyOpts);
	this.client = restify.createJSONClient({ url: opts.hook });

	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.queryParser());
	server.use(logEachRequest);
	server.use(restify.gzipResponse());
	server.use(restify.bodyParser({ mapParams: false }));

	server.get('/ping', this.handlePing.bind(this));
	server.post('/message', this.handleMessage.bind(this));

	this.server = server;
};

Opsbot.prototype.opts    = null;
Opsbot.prototype.log       = null;
Opsbot.prototype.server    = null;
Opsbot.prototype.client    = null;
Opsbot.prototype.responder = null;

Opsbot.prototype.listen = function listen(callback)
{
	this.server.listen(this.options.listen, callback);
	this.log.info('listening on ' + this.options.listen);
};

Opsbot.prototype.close = function close(callback)
{
	this.responder.close();
	this.server.close(callback);
};

Opsbot.prototype.handlePing = function handlePing(request, response, next)
{
	response.send(200, 'pong');
	next();
};

Opsbot.prototype.handleMessage = function handleMessage(request, response, next)
{
	var self = this;

	if (!request.body || request.body.token !== this.options.token)
	{
		return next(new restify.ForbiddenError('Go away.'));
	}

	// We send a 200 immediately. Any response the bot makes will
	// go into a post to the incoming webhook at our leisure.
	response.send(200);

	// We do not respond to our own messages.
	if (request.body.user_name === 'slackbot')
	{
		return next();
	}

	var channel = request.body.channel_name;
	if (channel[0] !== '#') channel = '#' + channel;

	var reqlog = request.log.child({
		command: request.body.text,
		sender:  request.body.user_name,
		channel: channel,
	});

	var opts = _.assign({}, request.body);
	opts.channel = channel;
	opts.username = opts.botname;

	var message = new Message(opts);
	message.on('reply', function(reply)
	{
		self.postToWebhook(reply, reqlog);
	});

	self.responder.handleMessage(message);
	next();
};

Opsbot.prototype.postToWebhook = function postToWebhook(message, logger)
{
	var self = this;

	self.client.post('', message, function(err, req, res, obj)
	{
		if (err)
			logger.error({error: err, message: message}, 'error posting to webhook');
		else if (res.statusCode === 200)
		{
			logger.info('response posted to ' + message.channel);
		}
	});
};

function logEachRequest(request, response, next)
{
	bole('request').info(request.method, request.url);
	next();
}
