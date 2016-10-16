// Respond with npm package facts.

var
	_       = require('lodash'),
	bole    = require('bole'),
	moment  = require('moment'),
	numeral = require('numeral'),
	Request = require('request')
	;

var logger = bole('npm');

function builder(yargs)
{
	return yargs
		.command('view <package>', 'see package info', noop, packageInfo)
		.command('downloads [period]', 'see downloads for the given time period', noop, downloadStats)
		.example('npm view opsbot', 'view the opsbot package')
		.example('npm downloads', 'download numbers for the last week')
		.example('npm downloads last-month', 'downloads for whatever the specified period is');
}

function noop() { }

function handler(argv)
{
}

module.exports = {
	command: 'npm <command>',
	describe: 'get information about packages',
	builder: builder,
	handler: handler,
	downloadStats: downloadStats, // for testing
	packageInfo: packageInfo, // for testing
};

// ----------------------------------------------------------------------

function downloadStats(message)
{
	var period = message.period || 'last-week';

	var opts = {
		uri: 'https://api.npmjs.org/downloads/range/' + period,
		json: true,
		method: 'GET',
	};

	Request(opts, function(err, res, obj)
	{
		if (err)
		{
			logger.error({ error: err, period: period }, 'fetching download stats');
			message.reply('Problem with download time period ' + period + ': ' + err.message);
			return;
		}

		var total = 0;
		var reply = _.map(obj.downloads, function(v, k)
		{
			total += v.downloads;
			return v.day + ': ' + numeral(v.downloads).format('0,0');
		});
		reply.unshift('*npm downloads by day:*');
		reply.push('\n*Total:* ' + numeral(total).format('0,0'));
		message.reply(reply.join('\n'));
	});
}

function packageInfo(message)
{
	var pkgName = message.package;
	var tmp;

	var opts = {
		uri: 'https://registry.npmjs.org/' + pkgName,
		json: true,
		method: 'GET',
	};

	Request(opts, function(err, res, obj)
	{
		if (err)
		{
			logger.error({ error: err, package: pkgName }, 'fetching from registry');
			message.reply(err.message);
			return;
		}

		var latestrev = obj['dist-tags'].latest;
		var struct = {
			color:   'good',
			pretext: obj.name,
			text:    obj.description,
			fields:  [],
		};

		struct.fields.push({ title: 'more info', value: '<https://npmjs.org/package/' + pkgName + '>' });

		if (obj.author)
		{
			struct.fields.push({
				title: 'author',
				value: obj.author.name + ' &lt;' + obj.author.email + '&gt;',
				short: true
			});
		}
		if (obj.maintainers)
		{
			tmp = _.map(obj.maintainers, function(m)
			{
				return m.name + ' &lt;' + m.email + '&gt;';
			}).join(', ');
			struct.fields.push({ title: 'maintainers', value: tmp, short: true });
		}

		if (obj.contributors)
		{
			tmp = _.pluck(obj.contributors, 'name').join(', ');
			struct.fields.push({ title: 'contributors', value: tmp, short: true });
		}

		if (obj.homepage) struct.fields.push({ title: 'homepage', value: '<' + obj.homepage + '>', short: true });
		var repo;
		if (obj.repository && obj.repository.url)
		{
			repo = obj.repository.url;
			struct.fields.push({ title: 'repo', value: '<' + obj.repository.url + '>', short: true });
		}

		struct.fields.push({ title: 'version', value: latestrev, short: true });

		var updated = moment(obj.time[latestrev]);
		struct.fields.push({ title: 'updated', value: updated.calendar(), short: true });

		var license = obj.versions[latestrev].license;
		if (!license)
		{
			var licenses = obj.versions[latestrev].licenses;
			if (licenses)
				license = licenses[0].type;
		}
		struct.fields.push({ title: 'license', value: license, short: true });

		struct.fallback = struct.pretext +
			'\n' + struct.text +
			'\nversion: ' + latestrev;
		if (repo)
			struct.fallback += '\nrepo: ' + repo;

		var reply = {
			text:         pkgName,
			attachments:  [struct],
			parse:        'full',
			unfurl_links: true
		};

		downloadsFor(pkgName, function(ignored, downloads)
		{
			if (downloads)
			{
				var tmp = '';
				if (downloads.last_week) tmp += 'Last week: ' + numeral(downloads.last_week).format('0,0');
				if (downloads.last_month) tmp += '\nLast month: ' + numeral(downloads.last_month).format('0,0');
				reply.attachments[0].fields.push({
					title: 'downloads',
					value: tmp,
					short: true
				});
			}
			message.reply(reply);
		});
	});
}

function downloadsFor(pkgName, callback)
{
	var result = {};

	var opts = {
		uri: 'https://api.npmjs.org/downloads/point/last-week/' + pkgName,
		json: true,
		method: 'GET',
	};

	Request(opts, function(err, res, obj)
	{
		if (err)
		{
			logger.error({error: err, package: pkgName }, 'downloads api error');
			return callback(err);
		}

		result.last_week = obj.downloads;

		opts.uri = 'https://api.npmjs.org/downloads/point/last-month/' + pkgName;
		Request(opts, function(err, res, obj)
		{
			if (err)
			{
				logger.error({error: err, package: pkgName }, 'downloads api error');
				return callback(result);
			}
			result.last_month = obj.downloads;
			callback(null, result);
		});
	});
}
