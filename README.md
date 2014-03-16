npmbot
======

this npm Slack chat battlestation is not yet fully operational. 

## deploying

TBD

Run it somewhere. Point your Slack webhook endpoint at its url.

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

### `new Plugin(opts)`

The required content of the options is up to the plugin itself. The options object will always be present and will always have a [bunyan](https://github.com/trentm/node-bunyan) logger object in the `log` field.

### `matches(str)`

A synchronous function that takes a string. Returns true if this plugin wants to handle the message, false otherwise. By convention and in order to be kind to fellow plugin authors, make this match on the prefix of incoming message. For instance `npm koa` might return information about the `koa` package on npm.

### `respond(str, callback)`

A function that takes a string and a node errorback. The callback must respond with a text string containing the response. You may also return a promise if you wish.

### `help()`

Synchronously return a usage string.

### Example 

Here's a simple plugin.

```javascript
module.exports = function OwlPlugin() { };

OwlPlugin.prototype.matches = function matches(msg)
{
    return msg.matches(/ORLY\?/);
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
