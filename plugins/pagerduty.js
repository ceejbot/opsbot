/*
    Pagerduty usefulness

    pagerduty oncall - who's on call now
    pagerduty rotation - the next 7 days of on call

    configuration:
    pagerduty:
    {
        apikey: 'your-key',
        urlprefix: 'your-pd-url-prefix'
    }
*/

var
    _       = require('lodash'),
    assert  = require('assert'),
    moment  = require('moment'),
    P       = require('bluebird'),
    request = require('request')
    ;

var PagerDuty = module.exports = function PagerDuty(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.apikey && _.isString(opts.apikey), 'you must pass an `apikey` option');
    assert(opts.urlprefix && _.isString(opts.urlprefix), 'you must pass a `urlprefix` option');

    this.opts = opts;
    this.reallybase = 'https://' + opts.urlprefix + '.pagerduty.com';
    this.baseurl = 'https://' + opts.urlprefix + '.pagerduty.com/api/v1/';
    this.reqopts =
    {
        headers: { authorization: 'Token token=' + opts.apikey },
        json: true
    };
};

PagerDuty.prototype.name = 'Pager Duty';
PagerDuty.prototype.client = null;
PagerDuty.prototype.pattern = /^pagerduty\s+(\w+)\s*$/;

PagerDuty.prototype.matches = function matches(msg)
{
    return this.pattern.test(msg);
};

PagerDuty.prototype.help = function help(msg)
{
    return 'get on-call rotation from PagerDuty\n' +
        '`pagerduty oncall` - who\'s on call now\n' +
        '`pagerduty rotation` - the next 4 days of on call';
};

PagerDuty.prototype.respond = function respond(message)
{
    var matches = this.pattern.exec(message.text);
    var command = matches ? matches[1] : 'help';

    switch (command)
    {
    case 'oncall':
        return this.oncall(message);
    case 'rotation':
        return this.rotation(message);
    default:
        message.done(this.help());
    }
};

PagerDuty.prototype.oncall = function oncall(message)
{
    var self = this;

    this.execute('/users/on_call')
    .then(function(reply)
    {
        var users = reply.users;
        var result = _.filter(users, function(u)
        {
            return (u.on_call[0].level === 1);
        }).map(function(u)
        {
            return u.name + ' <' + u.email + '>';
        });

        message.done('On call now: ' + result.join(', '));
    });
};

PagerDuty.prototype.rotation = function rotation(message)
{
    var self = this,
        schedules;

    this.execute('/schedules')
    .then(function(reply)
    {
        schedules = reply.schedules;

        var now = Date.now();
        var start = (new Date(now)).toISOString();
        var end = (new Date(now + 4 * 24 * 60 * 60 * 1000)).toISOString();

        var rotations = _.map(schedules, function(sched)
        {
            var uri = self.baseurl + '/schedules/' + sched.id + '/entries';
            return self.execute(
            {
                uri: uri + '?since=' + start + '&until=' + end,
                method: 'GET',
            });
        });

        return P.all(rotations);
    })
    .then(function(replies)
    {
        var i = 0;
        var rota = _.map(replies, function(rotation)
        {
            var sched = schedules[i];
            var result = sched.name + ':\n';

            _.each(rotation.entries, function(e)
            {
                result += '    ' + moment(e.start).calendar() + ': ' + e.user.name + ' <' + e.user.email + '>\n';
            });

            i++;
            return result;
        });

        message.done(rota.join('\n'));
    });
};

PagerDuty.prototype.execute = function execute(opts)
{
    var deferred = P.defer(),
        self = this;

    if (_.isString(opts))
    {
        opts =
        {
            uri: this.baseurl + opts,
            method: 'GET'
        };
    }
    _.defaults(opts, this.reqopts);

    request(opts, function(err, res, body)
    {
        if (err) return deferred.reject(err);
        if (!res || res.statusCode !== 200)
            return deferred.reject(new Error(res.statusCode));

        deferred.resolve(body);
    });

    return deferred.promise;
};
