// Respond with npm package facts.

var
    _       = require('lodash'),
    moment  = require('moment'),
    restify = require('restify')
    ;

var NPMPlugin = module.exports = function NPMPlugin(opts)
{
    this.log = opts.log;
    this.registry = restify.createJsonClient({ url: 'https://registry.npmjs.org' });
    this.downloads = restify.createJsonClient({ url: 'https://api.npmjs.org/' });
};

NPMPlugin.prototype.name = 'npm';
NPMPlugin.prototype.pattern = /^npm\s+(.*)$/;
NPMPlugin.prototype.promises = true;

NPMPlugin.prototype.matches = function matches(msg)
{
    return this.pattern.test(msg);
};

NPMPlugin.prototype.respond = function respond(message)
{
    var tmp;
    var msg = message.text || '';
    var matches = msg.trim().match(this.pattern);

    if (!matches)
    {
        message.done(this.help());
        return;
    }

    var package = matches[1];

    var self = this;

    this.registry.get('/' + package, function(err, request, res, obj)
    {
        if (err)
        {
            message.log(err.message);
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

        struct.fields.push({ title: 'More info', value: '<https://npmjs.org/package/' + package + '>' });

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

        self.getDownloadsFor(package, function(err, downloads)
        {
            if (downloads)
            {
                var tmp = '';
                if (downloads.last_week) tmp += 'Last week: ' + downloads.last_week;
                if (downloads.last_month) tmp += 'Last month: ' + downloads.last_month;
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

NPMPlugin.prototype.getDownloadsFor = function getDownloadsFor(package, callback)
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
    return 'get information about packages\n' + 'npm *packagename*';
};
