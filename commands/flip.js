var flip = require('flip');

function builder(yargs) {}

function handler(argv)
{
	var input = argv.text.join(' ');
	if (input === 'table' || input.length < 1) input = '┻━┻';
	argv.reply('(╯°□°）╯︵ ' + flip(input));
}

module.exports = {
	command: 'flip [text...]',
	describe: '(╯°□°）╯︵ ┻━┻',
	builder: builder,
	handler: handler
};
