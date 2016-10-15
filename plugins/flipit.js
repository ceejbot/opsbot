/*
100% lifted from the hubot module by jergason & spajus
When things aren't going well, you must flip it. (╯°□°）╯︵ ʇoqnɥ
*/

var flip = require('flip');

var Flipit = module.exports = function Flipit(opts)
{
	// no config
};

Flipit.prototype.name = 'FLIP IT';
Flipit.prototype.pattern = /^(rage\s?|un)?flip\s?(.*)$/;

Flipit.prototype.matches = function matches(msg)
{
	return this.pattern.test(msg);
};

Flipit.prototype.help = function help(msg)
{
	return '`flip` - table flip\n' +
		'`flip [text]` - express your anger more specifically\n' +
		'`rage flip [text]` - express your anger with rage\n' +
		'`unflip [text]` - calm down';
};

Flipit.prototype.respond = function respond(message)
{
	var msg = message.text;
	var matches = this.pattern.exec(msg);

	if (!matches)
	{
		message.done(this.help());
		return;
	}

	if (matches[1] === 'un')
	{
		this.unflip(matches, message);
		return;
	}

	var guy, flipped;

	if (matches[1])
		guy = '(ノಠ益ಠ)ノ彡';
	else
		guy = '(╯°□°）╯︵';

	var toflip = (matches[2] || '').trim();
	if (toflip === 'me')
		toflip = message.sender || 'you';

	if (toflip === '')
		flipped = '┻━┻';
	else
		flipped = flip(toflip);

	message.done(guy + ' ' + flipped);
};

Flipit.prototype.unflip = function unflip(matches, message)
{
	var unflipped;
	var toUnflip = (matches[2] || '').trim();

	if (toUnflip === 'me')
		unflipped = message.sender || 'you';
	else if (toUnflip === '')
		unflipped = '┬──┬';
	else
		unflipped = toUnflip;

	message.done(unflipped + ' ノ( º _ ºノ)');
};
