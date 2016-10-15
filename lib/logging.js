var
	bole         = require('bole'),
	fs           = require('fs'),
	path         = require('path')
	;

module.exports = function configureLogging(opts)
{
	if (exports.logger) return exports.logger;

	var outputs = [];
	if (opts.logging.path)
	{
		if (!fs.existsSync(opts.logging.path))
			fs.mkdirSync(opts.logging.path);

		var fname = path.join(opts.logging.path, opts.botname + '.log');
		outputs.push({ level: 'info', stream: fs.createWriteStream(fname) });
	}

	if (opts.logging.console)
	{
		if (process.env.NODE_ENV === 'dev')
		{
			var prettystream = require('bistre')({time: true}); // pretty
			prettystream.pipe(process.stdout);
			outputs.push({ level: 'debug', stream: prettystream });
		}
		else
			outputs.push({level: 'info', stream: process.stdout });
	}

	bole.output(outputs);
};
