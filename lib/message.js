var bole = require('bole');

var logger = bole('replies');

var Message = module.exports = function Message(opts)
{
	Object.assign(this, opts);
};

Message.prototype.brain = null;
Message.prototype.slack = null;
Message.prototype.logger = null;

Message.prototype.send = function send(payload)
{
	var textbit = typeof payload === 'string' ? payload : payload.text;
	var self = this;
	this.slack.sendMessage(textbit, this.channel, function(err, msg)
	{
		if (err) logger.error(err);
		else
		{
			logger.info(msg);
			if (typeof payload === 'object' && payload.attachments)
			{
				// post more stuff
				msg.opts = { attachments: payload.attachments };
				self.slack.updateMessage(msg, function(err, msg2)
				{
					if (err) logger.error(err);
				});
			}
		}
	});
};

Message.prototype.done = function done(reply)
{
	if (reply) this.send(reply);
};
