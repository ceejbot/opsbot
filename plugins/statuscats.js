// Get an http status cat image.

var pattern = /statuscats?\s+(\d+)/

var StatusCats = module.exports = function StatusCats(opts)
{
    // no config
};

StatusCats.prototype.matches = function matches(msg)
{
    return /^statuscat/.test(msg);
};

StatusCats.prototype.respond = function respond(msg, callback)
{
    var matches = pattern.exec(msg);
    if (!matches)
        return callback(null, this.help());

    var code = matches[1];

    var reply =
    {
        text: 'http://httpcats.herokuapp.com/' + code + '.jpg',
        parse: 'full',
        unfurl_links: true
    };

    callback(null, reply);
};

StatusCats.prototype.help = function help(msg)
{
    return 'statuscat: get an http status cat image\nUsage: statuscat *status-code*';
};
