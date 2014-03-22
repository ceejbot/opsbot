// Respond with npm package facts.

var
    _       = require('lodash'),
    moment  = require('moment'),
    restify = require('restify')
    ;

var NPMPlugin = module.exports = function NPMPlugin()
{
    this.client = restify.createJsonClient(
    {
        url: 'https://registry.npmjs.org',
    });
};

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
        message.done(this.help().usage);
        return;
    }

    var package = matches[1];

    var self = this;

    this.client.get('/' + package, function(err, request, res, obj)
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

        struct.fields.push({ title: 'More info', value: '<https://npmjs.org/package/' + package + '>' })

        if (obj.author) struct.fields.push({ title: 'author', value: obj.author.name + ' &lt;' + obj.author.email + '&gt;' });
        if (obj.maintainers)
        {
            tmp = _.map(obj.maintainers, function(m)
            {
                return m.name + ' &lt;' + m.email + '&gt;';
            }).join(', ');
            struct.fields.push({ title: 'maintainers', value: tmp });
        }

        if (obj.contributors)
        {
            tmp = _.pluck(obj.contributors, 'name').join(', ');
            struct.fields.push({ title: 'contributors', value: tmp });
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

        message.done(reply);
    });
};

NPMPlugin.prototype.help = function help(msg)
{
    return {
        npm: 'get information about packages',
        usage: 'npm *packagename*'
    };
};
