/*

List Trello cards & create new cards.

You will need to generate a developer key and a user token that has
access to the board & lists you wish to use.

https://trello.com/docs/gettingstarted/index.html#getting-an-application-key
https://trello.com/1/appKey/generate

Configuration:

trello:
{
    key:      'your-trello-api-key',
    token:    'your-trello-user-token',
    board:    'board-id',
    createIn: 'list-id-of-default',
    list:     'list-id',
}

*/

var
    _      = require('lodash'),
    assert = require('assert'),
    P      = require('bluebird'),
    Trello = require('node-trello')
    ;

var TrelloPlugin = module.exports = function TrelloPlugin(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.key && _.isString(opts.key), 'you must pass a `key` option');
    assert(opts.token && _.isString(opts.token), 'you must pass a `token` option');
    assert(opts.board && _.isString(opts.board), 'you must pass a `board` option');
    assert(opts.list && _.isString(opts.list), 'you must pass a list id in the `list` option');

    this.client = P.promisifyAll(new Trello(opts.key, opts.token));
    this.list = opts.list;
    this.createIn = opts.createIn || opts.list;
    this.log = opts.log;
};

TrelloPlugin.prototype.pattern  = /^trello\s+(\w+)\s?(.*)$/;
TrelloPlugin.prototype.client   = null;
TrelloPlugin.prototype.list     = null;
TrelloPlugin.prototype.createIn = null;

TrelloPlugin.prototype.matches = function matches(msg)
{
    return this.pattern.test(msg);
};

TrelloPlugin.prototype.respond = function respond(message)
{
    var msg = message.text;
    var matches = this.pattern.exec(msg);
    if (!matches) return message.done(this.help().usage);

    var promise;
    var command = matches[1];
    switch (command)
    {
    case 'card':
        promise = this.createCard(matches[2]);
        break;

    case 'show':
        promise = this.showCards(matches[2]);
        break;

    default:
        promise = P.resolve(this.help().usage);
        break;
    }

    promise.then(function(reply)
    {
        message.done(reply);
    })
};

TrelloPlugin.prototype.createCard = function createCard(title)
{
    var self = this;

    return this.client.postAsync('/1/cards', { name: title, idList: this.createIn })
    .then(function(data)
    {
        self.log.info('trello card created');
        return 'Card created at ' + data.url;
    }, function(err)
    {
        return 'There was an error creating the card: ' + err.message;
    });
};

TrelloPlugin.prototype.showCards = function showCards(title)
{
    return this.client.getAsync('/1/lists/' + this.list, { cards: 'open' })
    .then(function(data)
    {
        var result = 'Cards in ' + data.name + ':\n';
        _.each(data.cards, function(card)
        {
            result += '- ' + card.name + '\n';
        });
        return result;
    }, function(err)
    {
        return 'There was an error fetching the default list: ' + err.message;
    });
};

TrelloPlugin.prototype.help = function help(msg)
{
    return {
        trello: 'add and read Trello cards',
        usage: 'trello card *card title* - create a new card\ntrello show - show all cards'
    };
};
