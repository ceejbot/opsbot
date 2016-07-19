# opsbot

Hermione the npm operations [Slack](https://slack.com) chat battlestation is fully operational and is capable of demonstrating its power on a target, a military target. Name the system!

[![on npm](http://img.shields.io/npm/v/opsbot.svg?style=flat)](https://www.npmjs.org/package/opsbot)  [![Tests](http://img.shields.io/travis/ceejbot/opsbot.svg?style=flat)](http://travis-ci.org/ceejbot/opsbot)  ![Coverage](http://img.shields.io/badge/coverage-77%25-yellow.svg?style=flat)   [![Dependencies](http://img.shields.io/david/ceejbot/opsbot.svg?style=flat)](https://david-dm.org/ceejbot/opsbot)

## deploying

You'll want to create your own little node package for your installation. This package needs a `package.json`, a configuration file, and a shell script to run the bot.

Here's a nice minimal package.json, requiring opsbot & a third-party plugin:

```json
{
  "name": "deathstar",
  "version": "0.0.0",
  "description": "a bot of destruction",
  "scripts": {
    "start": "bash run.sh",
    "dev": "NODE_ENV=dev bash run.sh"
  },
  "dependencies": {
    "opsbot": "~1.0.0",
    "orlyowl": "^0.0.1"
  }
}
```

Here's `run.sh`:

```bash
#!/bin/bash
opsbot --config ./configuration.js
```

To create your configuration file, start by copying [config.example.js](https://github.com/ceejbot/opsbot/blob/master/config.example.js). Edit to your taste. You can have it log to console and/or log to a file depending on how you want to keep its logs. `npm start` runs the bot in prod mode. `npm run dev` will run it with pretty-printed console output.

Set up an outgoing webhook in Slack that points to `/messages` on your deployment URI. Set up a trigger word for the integration that is the botname you've configured. You can alternatively have the bot sent all traffic from a single channel.

Set up an incoming webhook in Slack. Add its full URI (with token) to the 'hook' field in your config.

List the plugins you want to load as fields in the `plugins` hash. The value should be an object with any required configuration for the plugin. Note that opsbot can load both built-in plugins and plugins installed via npm.

Example configuration:

```javascript
module.exports =
{
    botname: 'hermione',
    token: 'slack-integration-token-here',
    hook: 'your-slack-incoming-webhook-uri-here',
    brain: { dbpath: '/path/to/leveldb' },
    logging:
    {
        console: false,
        path: '/var/log'
    },
    plugins:
    {
        pagerduty: { apikey: 'your-key-here', urlprefix: 'your-prefix' },
        npm: {},
        statuscats: {},
    }
};
```

## built-in commands

`botname: help`: return a help message

`botname: status`: gives bot uptime, loaded plugins, and location of the bot's brain.

## writing plugins

Plugins must be objects with three required functions and a `name` field.

#### `new Plugin(opts)`

The constructor takes an options object. The required content of the options is up to the plugin itself. The options object will always be present and will always have a [bole](https://github.com/rvagg/bole) logger object in the `log` field. It will also have a leveldb instance in the `brain` field; see below.

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
__deployer:__ Invoke an ansible deployment playbook; requires customization for your environment.
__fastly:__ Fetches some current stats from the named Fastly service.  
__flipit:__ Table flip!  
__karma:__ Give points and take them away.  
__npm:__ Fetches package information from npm.  
__pagerduty:__ Show who's on call now & who's up in the next few days; list open incidents; ack & resolve incidents.  
__statuscats:__ Show an [http status cat](http://httpcats.herokuapp.com).  
__levenmorph:__ Morph one word into another using a nice short path.  

Each plugin has more documentation at the top of its source file.

## Plugin storage

Opsbot uses [levelup](https://github.com/rvagg/node-levelup) to provide a persistent key/value brain to plugins. Each plugin is, on construction, given an options object with a sublevel-namespaced db object in the `brain` field. This object might not be available if the opsbot configuration hasn't given it a path to store the db in, so your plugin should assert if it requires the brain but is not given one. See an example in the built-in `karma` plugin.

## Contributing

Write more plugins, add features to the existing plugins, it's all good.

Please follow the code style in existing files (4 spaces to indent, Allman bracing). If you write your own plugins, I don't much care what you do. Please try to be at least as responsible as I have been about writing tests.

If you want to use promises, go ahead! [bluebird](https://github.com/petkaantonov/bluebird) is already in the package deps.

If you write a plugin for opsbot & publish it on npm, please let me know so I can link it here! It might also help to give it the keyword `opsbot` so other people can find it when they search.

## Credits

Hermione the Opsbot is built on [node-restify](http://mcavage.me/node-restify/).

My colleagues [bcoe](https://github.com/bcoe) and [othiym23](https://github.com/othiym23/) have been invaluable.

## License

[ISC](http://opensource.org/licenses/ISC)
