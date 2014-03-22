var
    _       = require('lodash'),
    Bot     = require('./lib/bot'),
    logging = require('./lib/logging'),
    Message = require('./lib/message'),
    restify = require('restify'),
    config  = require('./config')
    ;

var log = logging(config);
config.log = log;

config.listen = process.env.PORT || config.listen || 3000;

var restifyOpts = { log: log };
var server = restify.createServer(restifyOpts);
var client = restify.createJSONClient({ url: config.hook });

var bot = new Bot(config);

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(logEachRequest);
server.use(restify.gzipResponse());
server.use(restify.bodyParser({ mapParams: false }));

server.get('/ping', handlePing);
server.post('/message', handleMessage);
server.listen(config.listen);
server.log.info('listening on ' + config.listen);

function handlePing(request, response, next)
{
    response.send(200, 'pong');
    next();
}

function handleMessage(request, response, next)
{
    if (request.body.token !== config.token)
    {
        return next(new restify.ForbiddenError('Go away.'));
    }

    // We send a 200 immediately. Any response the bot makes will
    // go into a post to the incoming webhook at our leisure.
    response.send(200);

    // We do not respond to our own messages.
    if (request.body.user_name === 'slackbot')
    {
        return next();
    }

    var channel = request.body.channel_name;
    if (channel[0] !== '#') channel = '#' + channel;

    var reqlog = request.log.child(
    {
        command: request.body.text,
        sender:  request.body.user_name,
        channel: channel,
    });

    var opts = _.assign({}, request.body);
    opts.channel = channel;
    opts.username = config.botname;

    var message = new Message(opts);
    message.on('reply', function(reply)
    {
        postToWebhook(reply, reqlog);
    });

    bot.handleMessage(message);
    next();
}

function logEachRequest(request, response, next)
{
    request.log.info(request.method, request.url);
    next();
}

function postToWebhook(message, logger)
{
    client.post('', message, function(err, req, res, obj)
    {
        if (err)
            logger.error({error: err, message: message}, 'error posting to webhook');
        else if (res.statusCode === 200)
        {
            logger.info('response posted to ' + message.channel);
        }
    });
}
