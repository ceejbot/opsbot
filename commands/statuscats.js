function builder(yargs) {}

function handler(argv)
{
	console.log(argv);
	argv.reply(`http://http.cat/${argv.code}.jpg`);
}

module.exports = {
	command: 'statuscat <code>',
	describe: 'get an http status cat',
	builder: builder,
	handler: handler
};
