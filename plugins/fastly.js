// answer questions about Fastly status
// NOT YET IMPLEMENTED

var
    P       = require('bluebird'),
    restify = require('restify')
    ;

var Fastly = module.exports = function Fastly(opts)
{
    this.apikey = opts.apikey;
    this.client = restify.createClient(
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

Fastly.prototype.respondAsync = function respond(msg)
{
    var matches = this.pattern.exec(msg);
    if (!matches) return P.resolve(this.help().usage);

    var field = matches[1];

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

    this.client.get(uri)
    Request(
    {
        method:  'GET',
        url:     'https://api.fastly.com' + uri,
        headers: { 'x-fastly-key': this.apikey },
        json:    true
    }, function(err, response, body)
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
