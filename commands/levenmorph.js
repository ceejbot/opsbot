var levenmorpher = require('levenmorpher');

function builder(yargs) {}

function handler(argv)
{
	var trail = levenmorpher(argv.word1, argv.word2);
	if (trail) argv.reply(trail.join('\n'));
	else argv.reply(`cannot morph ${argv.word1} to ${argv.word2}`);
}

module.exports = {
	command: 'morph <word1> to <word2',
	describe: 'morph the first word into the second',
	builder: builder,
	handler: handler
};
