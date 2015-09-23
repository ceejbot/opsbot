// Respond with npm package facts.

var
    _       = require('lodash'),
    moment  = require('moment'),
    numeral = require('numeral'),
    restify = require('restify')
;

var NPMPlugin = module.exports = function NPMPlugin(opts)
{
    this.log = opts.log;
    this.registry = restify.createJsonClient({ url: 'https://registry.npmjs.org' });
    this.downloads = restify.createJsonClient({ url: 'https://api.npmjs.org/' });
};

NPMPlugin.prototype.name = 'npm';
NPMPlugin.prototype.pattern = /^npm\s+(\S+)\s?(.*)?$/;
NPMPlugin.prototype.log = null;
NPMPlugin.prototype.registry = null;
NPMPlugin.prototype.downloads = null;

NPMPlugin.prototype.matches = function matches(msg)
{
    return this.pattern.test(msg);
};

NPMPlugin.prototype.respond = function respond(message)
{
    var msg = message.text || '';
    var matches = msg.trim().match(this.pattern);

    if (!matches)
        return message.done(this.help());

    if (matches[1] === 'downloads')
        return this.downloadStats(message, matches[2]);

    if (!matches[2])
        return this.packageInfo(message, matches[1]);

    message.done(this.help());
};

NPMPlugin.prototype.downloadStats = function downloadStats(message, period)
{
    period = period || 'last-week';
    var self = this;

    this.downloads.get('/downloads/range/' + period, function(err, req, res, obj)
    {
        if (err)
        {
            self.log.error({ error: err, period: period }, 'fetching download stats');
            message.done('Problem with download time period ' + period + ': ' + err.message);
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
        message.done(reply.join('\n'));
    });
};

NPMPlugin.prototype.packageInfo = function packageInfo(message, package)
{
    var tmp;
    var self = this;

    this.registry.get('/' + package, function(err, request, res, obj)
    {
        if (err)
        {
            self.log.error({ error: err, package: package }, 'fetching from registry');
            message.done(err.message);
            return;
        }

        var latestrev = obj['dist-tags'].latest;
        var struct =
        {
            color:   'good',
            pretext: obj.name,
            text:    obj.description,
            fields:  [],
        };

        struct.fields.push({ title: 'more info', value: '<https://npmjs.org/package/' + package + '>' });

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
        if (obj.repository.url) struct.fields.push({ title: 'repo', value: '<' + obj.repository.url + '>', short: true });
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
            '\nversion: ' + latestrev +
            '\nrepo: ' + obj.repository.url;

        var reply =
        {
            text:         '',
            attachments:  [struct],
            parse:        'full',
            unfurl_links: true
        };

        self.downloadsFor(package, function(ignored, downloads)
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
            message.done(reply);
        });
    });
};

NPMPlugin.prototype.downloadsFor = function downloadsFor(package, callback)
{
    var self = this;
    var result = {};

    this.downloads.get('/downloads/point/last-week/' + package, function(err, request, res, obj)
    {
        if (err)
        {
            self.log.error({error: err, package: package }, 'downloads api error');
            return callback(err);
        }

        result.last_week = obj.downloads;
        self.downloads.get('/downloads/point/last-month/' + package, function(err, request, res, obj)
        {
            if (err)
            {
                self.log.error({error: err, package: package }, 'downloads api error');
                return callback(result);
            }
            result.last_month = obj.downloads;
            callback(null, result);
        });
    });
};

NPMPlugin.prototype.help = function help(msg)
{
    return 'get information about packages\n' +
    '`npm [package]` - package info & download stats\n' +
    '`npm downloads` - download numbers for the last week\n' +
    '`npm downloads [period]` - download numbers for any valid downloads API period'
    ;
};
