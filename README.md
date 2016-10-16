# opsbot

Hermione the npm operations [Slack](https://slack.com) chat battlestation is fully operational and is capable of demonstrating its power on a target, a military target. Name the system!

[![on npm](http://img.shields.io/npm/v/opsbot.svg?style=flat)](https://www.npmjs.org/package/opsbot)  [![Tests](http://img.shields.io/travis/ceejbot/opsbot.svg?style=flat)](http://travis-ci.org/ceejbot/opsbot) [![Coverage Status](https://coveralls.io/repos/github/ceejbot/opsbot/badge.svg?branch=master)](https://coveralls.io/github/ceejbot/opsbot?branch=master)  [![Dependencies](http://img.shields.io/david/ceejbot/opsbot.svg?style=flat)](https://david-dm.org/ceejbot/opsbot)

## deploying

You'll want to create your own little node package for your installation. This package needs a `package.json`, a configuration file, and a shell script to run the bot.

Here's a nice minimal package.json, requiring opsbot & a third-party plugin:

```json
{
  "name": "deathstar",
  "version": "0.0.0",
  "description": "a bot of destruction",
  "scripts": {
    "start": "opsbot config.js",
    "dev": "NODE_ENV=dev opsbot testconfig.js"
  },
  "dependencies": {
    "opsbot": "~3.0.0",
    "opsbot-owl": "^0.0.1"
  }
}
```

To create your configuration file, start by copying [config.example.js](https://github.com/ceejbot/opsbot/blob/master/config.example.js). Edit to your taste. You can have it log to console and/or log to a file depending on how you want to keep its logs. `npm start` runs the bot in prod mode. `npm run dev` will run it with pretty-printed console output.

List the plugins you want to load as fields in the `plugins` hash. The value should be an object with any required configuration for the plugin. Note that opsbot can load both built-in plugins and plugins installed via npm.

Example configuration:

```json
{
	botname: "hermione",
	admin_channel: "your-admin-channel-id",
	brain: { dbpath: "./db" },
	plugins:
	{
		bartly:
		{
			apikey: "your-bart-api-key",
			station: "powl",
			tzOffset: 420,
		},
	}
}
```

Create a Slack bot and copy its API key. You must provide that key in the environment variable `SLACK_TOKEN`. One way to do that is to create a `.env` file containing the text `SLACK_TOKEN=your-token-here`. Opsbot will read that file if it's present.


## built-in commands

`botname: help`: return a help message

`botname: status`: gives bot uptime, loaded plugins, and location of the bot's brain.

## writing plugins

Plugs in are [yargs command modules](http://yargs.js.org/docs/#methods-commandmodule). To write a plugin, write a yargs command and then load it into opsbot via config. The handler for the yargs command has an object with all the usual yargs parsed items in it, plus a `reply()` function that can be called as many times as you wish to post messages to the Slack channel the original command came from.

`reply('string of text')` posts the given string of text.

`reply(messsageObj)` posts a message as formatted according to the [Slack message API](https://api.slack.com/methods/chat.postMessage).

Here's very boring plugin.

```javascript
function builder(yargs) {}

function handler(argv)
{
	argv.reply('https://cldup.com/5B3kURG8aE.jpg');
}

module.exports = {
	command: 'ORLY <text...>',
	describe: 'If you say ORLY?, you get the obvious response.',
	builder: builder,
	handler: handler
};
```

Let's suppose we've published this on npm as `opsbot-owl`. To load this epic chatbot feature, you'd add the module as a dependency of your bot package and then mention it in the config like this:

```json
{
	botname: "wol",
	admin_channel: "your-admin-channel-id",
	plugins:
	{
		"opsbot-owl": true
	}
}
```

## Provided plugins

__bartly:__ Real-time BART departure information by station. Requires an API key and, of all things, a timezone offset.
__flip:__ Table flip!  
__rageflip:__ Really table flip!  
__karma:__ Give points and take them away. Requires a database.
__npm:__ Fetch package information from npm.  
__statuscats:__ Show an [http status cat](http://http.cat).  
__statuscats:__ Show an [http status dog](http://httpstatusdogs.com).  
__morph:__ Morph one word into another using a nice short path.  

Each plugin has more documentation at the top of its source file.

## Plugin storage

Opsbot uses [levelup](https://github.com/rvagg/node-levelup) to provide a persistent key/value brain to plugins. Each plugin is, on construction, given an options object with a sublevel-namespaced db object in the `brain` field. This object might not be available if the opsbot configuration hasn't given it a path to store the db in, so your plugin should assert if it requires the brain but is not given one. See an example in the built-in `karma` plugin.

## Contributing

Write more plugins, add features to the existing plugins, it's all good.

Please follow the code style in existing files. `npm run lint` catches style problems as well as bugs. `xo --fix` might or might not actually fix them. If you write your own plugins, I don't much care what you do. Please try to be at least as responsible as I have been about writing tests.

If you want to use promises, go ahead! [bluebird](https://github.com/petkaantonov/bluebird) is already in the package deps.

If you write a plugin for opsbot & publish it on npm, please let me know so I can link it here! It might also help to give it the keyword `opsbot` so other people can find it when they search.

## License

[ISC](http://opensource.org/licenses/ISC)
