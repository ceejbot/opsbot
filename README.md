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
    token: 'required-token-here',
    logging:
    {
        console: true,
        path: '/var/log'
    },
    plugins:
    {
        npm: {},
        fastly: { apikey: 'my-key-here' },
        statuscats: {},
    }
};
```

## writing plugins

Plugins must be objects with three required functions. The constructor takes an options object.

#### `new Plugin(opts)`

The required content of the options is up to the plugin itself. The options object will always be present and will always have a [bunyan](https://github.com/trentm/node-bunyan) logger object in the `log` field.

#### `matches(str)`

A synchronous function that takes a string. Returns true if this plugin wants to handle the message, false otherwise. By convention and in order to be kind to fellow plugin authors, make this match on the prefix of incoming message. For instance `npm koa` might return information about the `koa` package on npm.

#### `respond(str, callback)`

A function that takes a string and a node errorback. The callback must respond with a text string containing the response. You may also return a promise if you wish.

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
