var Message = module.exports = function Message(opts)
{
	Object.assign(this, opts);
};

Message.prototype.brain = null;
Message.prototype.slack = null;
Message.prototype.logger = null;

Message.prototype.send = function send(payload)
{
	var reply = typeof payload === 'object' ? payload.text : payload;
	this.slack.sendMessage(reply, this.channel);
	this.logger.info(reply);
};

Message.prototype.done = function done(reply)
{
	if (reply) this.send(reply);
};
