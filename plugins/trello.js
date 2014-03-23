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
    this.board = opts.board;
    this.list = opts.list;
    this.createIn = opts.createIn || opts.list;
    this.log = opts.log;

    this.fetchMembers();
};

TrelloPlugin.prototype.members = null;

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

    var promise, pieces;
    var command = matches[1];
    switch (command)
    {
    case 'card':
        promise = this.createCard(matches[2]);
        break;

    case 'show':
        promise = this.showCards(matches[2]);
        break;

    case 'join':
        pieces = matches[2].split(/\s+/);
        promise = this.joinToCard(pieces[0], pieces[1]);
        break;

    case 'leave':
        pieces = matches[2].split(/\s+/);
        promise = this.leaveCard(pieces[0], pieces[1]);
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

TrelloPlugin.prototype.fetchMembers = function fetchMembers()
{
    var self = this;

    return this.client.getAsync('/1/boards/' + this.board + '/members')
    .then(function(data)
    {
        self.members = {};
        _.each(data, function(u)
        {
            self.members[u.username] = u;
        });

        return self.members;
    }, function(err)
    {
        self.log.warn({error: err}, 'problem fetching trello board users');
    });
};

TrelloPlugin.prototype.joinToCard = function joinToCard(card, member)
{
    var user = this.members[member];
    var id = user ? user.id : member;

    return this.client.postAsync('/1/cards/' + card + '/idMembers', { value: id })
    .then(function(reply)
    {
        return (user ? user.fullName : member) + ' has joined card https://trello.com/c/' + card;
    }, function(err)
    {
        return 'There was an error joining ' + member + ' to card <' + card + '>: ' + err.message;
    });
};

TrelloPlugin.prototype.leaveCard = function leaveCard(card, member)
{
    var user = this.members[member];
    var id = user ? user.id : member;

    return this.client.delAsync('/1/cards/' + card + '/idMembers/' + id)
    .then(function(reply)
    {
        return (user ? user.fullName : member) + ' has left card https://trello.com/c/' + card;
    }, function(err)
    {
        return 'There was an error removing ' + member + ' from card <' + card + '>: ' + err.message;
    });
};

TrelloPlugin.prototype.help = function help(msg)
{
    return {
        trello: 'add and read Trello cards',
        usage: 'trello card <card title> - create a new card\n' +
            'trello join <card-id> <user-name> - add user to card\n' +
            'trello leave <card-id> <user-name> - remove user from card\n' +
            'trello show - show all cards'
    };
};
