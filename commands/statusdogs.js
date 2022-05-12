function builder(yargs) {}

function handler(argv)
{
	argv.reply(`https://http.dog/${argv.code}`);
}

module.exports = {
	command: 'statusdog <code>',
	describe: 'get an http status dog',
	builder: builder,
	handler: handler
};
