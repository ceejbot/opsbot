// Get an http status cat image.

var pattern = /statuscat\s+(\d+)/

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
    callback(null, 'http://httpcats.herokuapp.com/' + code);
};

StatusCats.prototype.help = function help(msg)
{
    return 'statuscat: get an http status cat image\nUsage: statuscat <status-code>';
};
