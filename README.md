# opsbot

this npm operations Slack chat battlestation is not yet fully operational. 

[![Build Status](https://secure.travis-ci.org/ceejbot/opsbot.png)](http://travis-ci.org/ceejbot/opsbot) [![Dependencies](https://david-dm.org/ceejbot/opsbot.png)](https://david-dm.org/ceejbot/opsbot)

## deploying

Clone the repo somewhere. Copy `config.example.js` to `config.js`. Edit to your taste. You can have it log to console and/or log to a file depending on how you want to keep its logs. `npm start` runs the bot in prod mode. `npm run dev` will run it with pretty-printed console output.

Set up an outgoing webhook in Slack that points to `/messages` on your deployment URI. Set up a trigger word for the integration that is the botname you've configured. You can alternatively have the bot sent all traffic from a single channel.

### configuration

Example:

```javascript
module.exports = 
{
    botname: 'hermione',
    token: 'slack-integration-token-here',
    logging:
    {
        console: true,
        path: '/var/log'
    },
    plugins:
    {
        npm: { /* plugin opts here */ },
        fastly: { apikey: 'my-key-here' },
        statuscats: { /* no options needed */ },
    }
};
```

## built-in commands

`botname: help`: return a help message

`botname: status`: return status; not yet implemented and might not be needed!

## writing plugins

Plugins must be objects with three required functions. 

#### `new Plugin(opts)`

The constructor takes an options object. The required content of the options is up to the plugin itself. The options object will always be present and will always have a [bunyan](https://github.com/trentm/node-bunyan) logger object in the `log` field.

#### `matches(str)`

A synchronous function that takes a string. Returns true if this plugin wants to handle the message, false otherwise. By convention and in order to be kind to fellow plugin authors, make this match on the prefix of incoming message. For instance `npm koa` might return information about the `koa` package on npm.

#### `respond(str, callback)`

A function that takes a string and a node errorback. The callback must respond with a text string containing the response. You may also return a promise if you wish. The official promises library of opsbot is [bluebird](https://github.com/petkaantonov/bluebird).

`respond()` may also return a fully-structured message with attachments as documented in [the Slack API](https://api.slack.com/docs/attachments). The response handler will decorate the response with any missing required fields.

#### `help()`

Synchronously return a usage string.

### Example 

Here's a simple plugin.

```javascript
module.exports = function OwlPlugin() { };

OwlPlugin.prototype.matches = function matches(msg)
{
    return msg.match(/ORLY\?/);
};

OwlPlugin.prototype.respond = function respond(msg, callback)
{
    callback(null, 'YA RLY');
};

OwlPlugin.prototype.help = function help()
{
    return 'If you say ORLY?, you get the obvious response.';
};
```

## TODO

I'm running this against our Slack chat already, though it doesn't do much yet. The two existing plugins work perfectly well! There's some chance I might streamline the plugin API to use either only promises or only callbacks because I don't like its messiness right now.

- make plugins loadable from installed modules as well as the plugins directory
- clean up & finalize plugin API
- write more plugins

## License

MIT
