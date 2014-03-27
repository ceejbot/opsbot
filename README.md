# opsbot

Hermione the npm operations [Slack](https://slack.com) chat battlestation is not yet fully operational but it is capable of demonstrating its power on a target, a military target. Name the system!

[![Build Status](https://secure.travis-ci.org/ceejbot/opsbot.png)](http://travis-ci.org/ceejbot/opsbot) [![Dependencies](https://david-dm.org/ceejbot/opsbot.png)](https://david-dm.org/ceejbot/opsbot)

## deploying

Clone the repo somewhere. Copy `config.example.js` to `config.js`. Edit to your taste. You can have it log to console and/or log to a file depending on how you want to keep its logs. `npm start` runs the bot in prod mode. `npm run dev` will run it with pretty-printed console output.

Set up an outgoing webhook in Slack that points to `/messages` on your deployment URI. Set up a trigger word for the integration that is the botname you've configured. You can alternatively have the bot sent all traffic from a single channel.

Set up an incoming webhook in Slack. Add its full URI (with token) to the 'hook' field in your config.

List the plugins you want to load as fields in the `plugins` hash. The value should be an object with any required configuration for the plugin. 

Example configuration:

```javascript
module.exports =
{
    botname: 'hermione',
    token: 'slack-integration-token-here',
    hook: 'your-slack-incoming-webhook-uri-here',
    logging:
    { 
        console: false,
        path: '/var/log'
    },
    plugins:
    {
        fastly: { apikey: 'your-key-here' },
        npm: {},
        statuscats: {},
    }
};
```

## built-in commands

`botname: help`: return a help message

`botname: status`: return status; not yet implemented and might not be needed!

## writing plugins

Plugins must be objects with three required functions and a `name` field.

#### `new Plugin(opts)`

The constructor takes an options object. The required content of the options is up to the plugin itself. The options object will always be present and will always have a [bunyan](https://github.com/trentm/node-bunyan) logger object in the `log` field.

#### `matches(str)`

A synchronous function that takes a string. Returns true if this plugin wants to handle the message, false otherwise. By convention and in order to be kind to fellow plugin authors, make this match on the prefix of incoming message. For instance `npm koa` might return information about the `koa` package on npm.

#### `respond(message)`

A function that takes a `Message` object. This function is expected to call `message.send()` with a string or with a fully-structured message with attachments as documented in [the Slack API](https://api.slack.com/docs/attachments). The response handler will decorate the response with any missing required fields.

When you are finished sending replies to the incoming message, call `message.done()`. As a convenience, if the message requires only a single reply, you can call `message.done(reply)` to send & clean up.

#### `help()`

Synchronously return a string with usage information.

### Example 

Here's a simple plugin.

```javascript
module.exports = function OwlPlugin() { };

OwlPlugin.prototype.name = 'ORLYOWL';

OwlPlugin.prototype.matches = function matches(msg)
{
    return msg.match(/ORLY\?/);
};

OwlPlugin.prototype.respond = function respond(msg)
{
    msg.done('YA RLY');
};

OwlPlugin.prototype.help = function help()
{
    return 'If you say ORLY?, you get the obvious response.';
};
```

## Provided plugins

__bartly:__ Real-time BART departure information by station.  
__fastly:__ Fetches some current stats from the named Fastly service.  
__flipit:__ Table flip!  
__npm:__ Fetches package information from npm.  
__pagerduty:__ Show who's on call now & who's up in the next few days.  
__statuscats:__ Show an [http status cat](http://httpcats.herokuapp.com).  
__trello:__ List open cards, create cards, join & leave cards. (To be retired when Slack's integration improves.)  

## Contributing

Write more plugins, add features to the existing plugins, it's all good.

Please follow the code style in existing files (4 spaces to indent, Allman bracing). If you write your own plugins, I don't much care what you do. Please try to be at least as responsible as I have been about writing tests.

If you want to use promises, go ahead! [bluebird](https://github.com/petkaantonov/bluebird) is already in the package deps.

## TODO

I'm running this against our Slack chat already. The existing existing plugins work perfectly well! 

- write more plugins

## Credits

Hermione the Opsbot is built on [node-restify](http://mcavage.me/node-restify/).

## License

[ISC](http://opensource.org/licenses/ISC)
