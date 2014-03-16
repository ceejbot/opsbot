var
    Bot     = require('./lib/bot'),
    logging = require('./lib/logging'),
    restify = require('restify'),
    config  = require('./config')
    ;

var restifyOpts =
{
    log: logging(config)
};
var server = restify.createServer(restifyOpts);
var bot = new Bot(config);

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(logEachRequest);
server.use(restify.gzipResponse());
server.use(restify.bodyParser({ mapParams: false }));

server.get('/ping', ping);
server.post('/message', message);
server.listen(process.env.port || 3000);
server.log.info('listening on ' + (process.env.port || 3000));

function ping(request, response, next)
{
    response.send(200, 'pong');
    next();
}

function message(request, response, next)
{
    // We do not respond to our own messages.
    if (request.body.user_name === 'slackbot')
    {
        response.send(200);
        return next();
    }

    var commandLog = req.log.child(
    {
        command: request.body.text,
        sender:  request.body.user_name,
        channel: request.body.channel_name,
    });

    bot.handleMessage(request.body.text)
    .then(function(reply)
    {
        commandLog.info(reply.message);
        response.json(200, { text: reply.message, channel: request.body.channel_name });
        next();
    }, function(err)
    {
        commandLog.warn({ error: err }, 'error constructing reply');
        response.json(200, { text: err.message, channel: request.body.channel_name });
        next();
    }).done();
}

function logEachRequest(request, response, next)
{
    request.log.info(request.method, request.url);
    next();
}

