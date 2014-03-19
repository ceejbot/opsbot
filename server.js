var
    _       = require('lodash'),
    Bot     = require('./lib/bot'),
    logging = require('./lib/logging'),
    restify = require('restify'),
    config  = require('./config')
    ;

var log = logging(config);
config.log = log;

var restifyOpts = { log: log };
var server = restify.createServer(restifyOpts);
var client = restify.createJSONClient({ url: config.hook });

var bot = new Bot(config);

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(logEachRequest);
server.use(restify.gzipResponse());
server.use(restify.bodyParser({ mapParams: false }));

server.get('/ping', ping);
server.post('/message', message);
server.listen(process.env.PORT || 3000);
server.log.info('listening on ' + (process.env.PORT || 3000));

function ping(request, response, next)
{
    response.send(200, 'pong');
    next();
}

function message(request, response, next)
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

    var reqlog = request.log.child(
    {
        command: request.body.text,
        sender:  request.body.user_name,
        channel: request.body.channel_name,
    });

    bot.handleMessage(request.body)
    .then(function(reply)
    {
        if (reply && _.isString(reply))
        {
            postToWebhook(
            {
                text:       reply,
                channel:    '#' + request.body.channel_name,
                username:   config.botname,
                link_names: 1
            }, reqlog);
        }
        else if (reply && _.isObject(reply))
        {
            var full =_.extend(
            {
                channel:    '#' + request.body.channel_name,
                username:   config.botname,
                link_names: 1
            }, reply);

            postToWebhook(full, reqlog);
        }
        next();
    }, function(err)
    {
        reqlog.warn({ error: err }, 'error constructing reply');
        postToWebhook({ text: err.message, channel: request.body.channel_name }, reqlog);
        next();
    }).done();
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
            logger.info('response posted: ' + message.text);
        }
    });
}
