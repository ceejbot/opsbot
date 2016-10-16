var flip = require('flip');

function builder(yargs) {}

function handler(argv)
{
	var input = argv.text.join(' ');
	if (input === 'table' || input.length < 1) input = '┻━┻';
	argv.reply('(ノಠ益ಠ)ノ彡 ' + flip(input));
}

module.exports = {
	command: 'rageflip <text...>',
	describe: '(ノಠ益ಠ)ノ彡 ┻━┻',
	builder: builder,
	handler: handler
};
