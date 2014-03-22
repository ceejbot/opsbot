// answer questions about Fastly status
// NOT YET IMPLEMENTED

var
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

Fastly.prototype.pattern = /^fastly\s+(\w+)\s?(.*)?$/;

Fastly.prototype.matches = function matches(msg)
{
    return /^fastly/.test(msg);
};

Fastly.prototype.respond = function respond(message)
{
    var msg = message.text;
    var matches = this.pattern.exec(msg);
    if (!matches) return message.done(this.help().usage);

    var field = matches[1];

    message.done('fastly support not yet implemented');
};


Fastly.prototype.help = function help(msg)
{
    return {
        fastly: 'get current stats from fastly',
        usage: 'fastly *field* (eg, status_503, errors, requests',
    };
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

        if (body.status !== 'success') return deferred.reject(new Error(body.msg));

        deferred.resolve(body);
    });

    return deferred.promise;
}
