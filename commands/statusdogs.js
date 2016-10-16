function builder(yargs) {}

function handler(argv)
{
	argv.reply(`https://httpstatusdogs.com/${argv.code}`);
}

module.exports = {
	command: 'statusdog <code>',
	describe: 'get an http status dog',
	builder: builder,
	handler: handler
};
