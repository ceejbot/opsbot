// answer questions about Fastly status

var
    _       = require('lodash'),
    P       = require('bluebird'),
    restify = require('restify')
    ;

var Fastly = module.exports = function Fastly(opts)
{
    this.apikey = opts.apikey;
    this.client = restify.createJSONClient(
    {
        url: 'https://api.fastly.com',
        headers: { 'x-fastly-key': opts.apikey }
    });
};

Fastly.prototype.name = 'fastly';
Fastly.prototype.pattern = /(.+)\s+(\w+)?$/;

Fastly.prototype.matches = function matches(msg)
{
    return /^fastly/.test(msg);
};

Fastly.prototype.respond = function respond(message)
{
    var msg = message.text;
    msg = msg.replace(/^fastly\s?/, '');
    if (msg === 'services') return this.listServices(message);

    var matches = this.pattern.exec(msg);
    if (!matches) return message.done(this.help());

    var service = matches[1];
    var field = matches[2];

    this.fetchField(service, field)
    .then(function(reply)
    {
        message.done(reply);
    }).done();
};

Fastly.prototype.help = function help(msg)
{
    return 'get current stats from fastly\n' +
        '`fastly services` - list all known services\n' +
        '`fastly [service] [field]` - get stats for the given field & service (eg, `status_503`, `errors`, `hits`)';
};

Fastly.prototype.listServices = function listServices(message)
{
    this.fetchServices()
    .then(function(services)
    {
        message.done('Fastly services:\n' + _.map(services, function(v, k) { return k; }).join('\n'));
    }, function(err) { message.done(err.message); })
    .done();
};

Fastly.prototype.fetchField = function fetchField(service, field)
{
    var self = this,
        id;

    return this.fetchServices()
    .then(function(services)
    {
        id = services[service];
        if (!id)
            throw new Error('Cannot find service ' + service);

        return self.execute('/stats/service/' + id + '?by=minute');
    })
    .then(function(response)
    {
        var fields = 0;
        var requests = 0;

        if (!response.data) return 'No data for ' + service + ' in the last 30 minutes.';

        _.each(response.data, function(item, k)
        {
            fields += parseInt(item[field], 10);
            requests += item.requests;
        });

        var last = response.data[response.data.length - 1];

        var reply = field + ' for ' + service + ':\n';
        reply += 'Last minute: ' + last[field] + ' ' + field + ' for ' + last.requests + ' requests\n';
        reply += 'Last 30 min: ' + fields + ' / ' + requests;

        return reply;
    }, function(err) { return err.message; });
};

Fastly.prototype.fetchServices = function fetchServices()
{
    return this.execute('/service')
    .then(function(reply)
    {
        var result = {};
        _.each(reply, function(service)
        {
            result[service.name] = service.id;
        });
        return result;
    });
};

Fastly.prototype.execute = function execute(uri)
{
    var deferred = P.defer();

    this.client.get(uri, function(err, req, response, body)
    {
        if (err) return deferred.reject(err);
        if (!response || (response.statusCode < 200) || (response.statusCode > 302))
        {
            return deferred.reject(new Error('Fastly status code ' + response.statusCode));
        }

        deferred.resolve(body);
    });

    return deferred.promise;
};
