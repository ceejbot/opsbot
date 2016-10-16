/*
Morph one word to another. No config required.
*/

var levenmorpher = require('levenmorpher');

var Levenmorph = module.exports = function Levenmorph(opts)
{
	// no config
};

Levenmorph.prototype.name = 'levenmorph';
Levenmorph.prototype.pattern = /^(?:leven)?morph\s+((\w+)(?:\s+to)?\s+(\w+)|help)$/;

Levenmorph.prototype.matches = function matches(msg)
{
	return this.pattern.test(msg);
};

Levenmorph.prototype.help = function help(msg)
{
	return '`levenmorph word1 to word2` - morph the first word into the second';
};

Levenmorph.prototype.respond = function respond(message)
{
	var matches = this.pattern.exec(message.text);
	if (!matches)
	{
		message.done(this.help());
		return;
	}

	var trail = levenmorpher(matches[2], matches[3]);
	if (trail) message.done(trail.join('\n'));
	else message.done(`cannot morph ${matches[2]} to ${matches[3]}`);
};
