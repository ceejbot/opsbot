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
    assert(opts.brain, 'the pagerduty plugin requires a brain for storage');

    this.opts = opts;
    this.log = opts.log;
    this.brain = opts.brain;
    this.reallybase = 'https://' + opts.urlprefix + '.pagerduty.com';
    this.baseurl = 'https://' + opts.urlprefix + '.pagerduty.com/api/v1/';
    this.reqopts =
    {
        headers: { authorization: 'Token token=' + opts.apikey },
        json: true
    };
};

PagerDuty.prototype.name = 'Pager Duty';
PagerDuty.prototype.brain = null;
PagerDuty.prototype.client = null;
PagerDuty.prototype.pattern = /^pagerduty\s+(\w+)\s*(.+)?$|(who's on call)/;

PagerDuty.prototype.matches = function matches(msg)
{
    return this.pattern.test(msg);
};

PagerDuty.prototype.help = function help(msg)
{
    return 'get on-call rotation from PagerDuty\n' +
        '`pagerduty oncall` - who\'s on call now\n' +
        '`pagerduty rotation` - the next 4 days of on call\n' +
        '`pagerduty open` - open incidents\n' +
        '`pagerduty incident #` - details on the incident by ID or number\n' +
        '`pagerduty ack [id]` - ack an incident by ID\n' +
        '`pagerduty resolve [id]` - resolve an incident by ID\n' +
        '`pagerduty users` - list all users we have ids for\n' +
        '`pagerduty userid [id]` - set your pagerduty id to *id*\n' +
        '`pagerduty userid [slackuser] [id]` - set the pagerduty id for another slack user\n' +
        '';
};

PagerDuty.prototype.respond = function respond(message)
{
    var matches = this.pattern.exec(message.text.trim());

    if (matches[3] === 'who\'s on call')
        return this.oncall(message);

    switch (matches[1].toLowerCase())
    {
    case 'oncall':
        return this.oncall(message);
    case 'rotation':
        return this.rotation(message);
    case 'incidents':
    case 'open':
        return this.opened(message);
    case 'details':
    case 'incident':
        return this.incident(message, matches[2]);
    case 'ack':
    case 'acknowledge':
        return this.ack(message, matches[2]);
    case 'resolve':
        return this.resolve(message, matches[2]);
    case 'users':
        return this.users(message);
    case 'userid':
        return this.userid(message, matches[2]);
    default:
        message.done(this.help());
    }
};

// utilities --------------------------

PagerDuty.prototype.formatUser = function formatUser(u)
{
    return '<' + this.reallybase + u.user_url + '|' + u.name + '>';
};

// schedules --------------------------

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
        }).map(self.formatUser.bind(self));

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
                result += '    ' + moment(e.start).calendar() + ': ' + self.formatUser(e.user) + '\n';
            });

            i++;
            return result;
        });

        message.done(rota.join('\n'));
    });
};

// users --------------------------

PagerDuty.prototype.users = function users(message)
{
    this.brain.createReadStream()
    .on('data', function(data)
    {
        var id = data.key.replace('user:', '');
        message.send('PagerDuty: ' + id + ' => ' + data.value);
    })
    .on('error', function(err)
    {
        message.send('Error fetching pagerduty users: ' + err.message);
    })
    .on('end', function() { message.done(); } );
};

PagerDuty.prototype.userid = function userid(message, id)
{
    var self = this,
        sender = message.user_name;

    if (id.match(/\s+/))
    {
        var pieces = id.split(/\s+/);
        sender = pieces[0];
        id = pieces[1];
    }

    this.brain.put('user:' + sender, id, function(err)
    {
        if (err) message.done(err.message);
        else message.done('pager duty id for ' + sender + ' set to ' + id);
    });
};

PagerDuty.prototype.lookupUser = function lookupUser(message)
{
    var self = this,
        deferred = P.defer(),
        sender = message.user_name;

    this.brain.get('user:' + sender, function(err, id)
    {
        if (err) return deferred.reject(err);
        deferred.resolve(id);
    });

    return deferred.promise;
};

// incidents --------------------------

PagerDuty.prototype.incident = function incident(message, id)
{
    var self = this;

    this.execute('/incidents/' + id)
    .then(function(incident)
    {
        var result = [];
        result.push('*ID:* <' + incident.html_url + '|' + incident.id + '>');
        result.push('*Number:* ' + incident.incident_number);
        result.push('*Started:* ' + moment(incident.created_on).fromNow());
        result.push('*Status:* ' + incident.status);
        result.push('*Key:* ' + incident.incident_key);

        message.done(result.join('\n'));
    }, function(err)
    {
        self.log.error({ error: err }, '/incident/' + id);
        message.done('Problem fetching incident: ' + err.message);
    });
};

PagerDuty.prototype.ack = function ack(message, id)
{
    var self = this;

    this.lookupUser(message)
    .then(function(user)
    {
        var opts =
        {
            uri: self.baseurl + 'incidents/' + id + '/acknowledge?requester_id=' + user,
            method: 'PUT',
        };
        return self.execute(opts);
    })
    .then(function(reply)
    {
        if (reply.error)
        {
            if (reply.error.code === 5001)
                message.done('Incident ' + id + ' not found. Are you using the PagerDuty ID string?');
            else if (reply.error.code === 1001)
                message.done('Incident ' + id + ' already resolved, slowpoke.');
            else
                message.done('Could not ack: ' + reply.error.message);
            return;
        }

        message.done('Incident ' + id + ' acked.');

    }, function(err)
    {
        self.log.error({ error: err }, '/incident/' + id);
        message.done('Problem fetching incident: ' + err.message);
    });
};

PagerDuty.prototype.resolve = function resolve(message, id)
{
    var self = this;

    this.lookupUser(message)
    .then(function(user)
    {
        var opts =
        {
            uri: self.baseurl + 'incidents/' + id + '/resolve?requester_id=' + user,
            method: 'PUT',
        };
        return self.execute(opts);
    })
    .then(function(reply)
    {
        if (reply.error)
        {
            if (reply.error.code === 5001)
                message.done('Incident ' + id + ' not found. Are you using the PagerDuty ID string?');
            else if (reply.error.code === 1001)
                message.done('Incident ' + id + ' already resolved, slowpoke.');
            else
                message.done('Could not resolve: ' + reply.error.message);
            return;
        }
        message.done('Incident ' + id + ' resolved.');

    }, function(err)
    {
        self.log.error({ error: err }, '/incident/' + id);
        message.done('Problem fetching incident: ' + err.message);
    });
};

PagerDuty.prototype.opened = function opened(message)
{
    var self = this;

    self.execute('/incidents?status=triggered,acknowledged')
    .then(function(response)
    {
        var incidents = response.incidents;

        if (incidents.length === 0)
            return message.done('No incidents open! Yay!');

        // id, html_url, trigger_summary_data

        var result = _.map(incidents, function(incident)
        {
            // TODO horrible hack for the moment
            return '*incident:* <' + incident.html_url + '|' + incident.id + '>\n' +
                JSON.stringify(incident.trigger_summary_data);
        });

        message.done(result.join('\n'));
    }, function(err)
    {
        self.log.error({ error: err }, 'problem using pagerduty api');
        message.done('Problem fetching open incidents: ' + err.message);
    });
};

// API --------------------------

PagerDuty.prototype.execute = function execute(opts)
{
    var deferred = P.defer(),
        self = this;

    if (_.isString(opts))
    {
        opts =
        {
            uri: self.baseurl + opts,
            method: 'GET'
        };
    }
    _.defaults(opts, this.reqopts);

    request(opts, function(err, res, body)
    {
        if (err) return deferred.reject(err);
        deferred.resolve(body);
    });

    return deferred.promise;
};
