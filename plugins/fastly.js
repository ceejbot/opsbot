// answer questions about Fastly status
// NOT YET IMPLEMENTED

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
Fastly.prototype.pattern = /^fastly\s+(.+)\s+(\w+)$/;

Fastly.prototype.matches = function matches(msg)
{
    return /^fastly/.test(msg);
};

Fastly.prototype.respond = function respond(message)
{
    var msg = message.text;
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
        'fastly *service* *field* (eg, status_503, errors, hits)';
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
    var deferred = P.defer(),
        self = this;

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
}
