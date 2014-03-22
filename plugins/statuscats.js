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

StatusCats.prototype.respond = function respond(message)
{
    var msg = message.text;
    var matches = pattern.exec(msg);

    var text;
    if (!matches)
        text = this.help();
    else
        text = 'http://httpcats.herokuapp.com/' + matches[1] + '.jpg';

    message.done(text);
};

StatusCats.prototype.help = function help(msg)
{
    return {
        statuscat: 'get an http status cat image',
        usage: 'statuscat *status-code*'
    };
};
