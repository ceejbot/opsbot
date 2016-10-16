function builder(yargs) {}

function handler(argv)
{
	argv.reply(`http://httpcats.herokuapp.com/${argv.code}.jpg`);
}

module.exports = {
	command: 'statuscat <code>',
	describe: 'get an http status cat',
	builder: builder,
	handler: handler
};
