var
    _      = require('lodash'),
    assert = require('assert'),
    P      = require('bluebird'),
    Trello = require('node-trello')
    ;

var TrelloPlugin = module.exports = function TrelloPlugin(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.key && _.isString(opts.key), 'you must pass a key option');
    assert(opts.token && _.isString(opts.token), 'you must pass a token option');

    this.client = P.promisifyAll(new Trello(opts.key, opts.token));
    this.list = opts.list;
    this.createIn = opts.createIn || opts.list;
    this.log = opts.log;
};

TrelloPlugin.prototype.client   = null;
TrelloPlugin.prototype.list     = null;
TrelloPlugin.prototype.createIn = null;
TrelloPlugin.prototype.promises = true;
TrelloPlugin.prototype.pattern  = /^trello\s+(\w+)\s?(.*)$/;

TrelloPlugin.prototype.matches = function matches(msg)
{
    return /^trello\s+/.test(msg);
};

TrelloPlugin.prototype.respond = function respond(msg)
{
    var matches = this.pattern.exec(msg);
    if (!matches) return P.resolve(this.help().usage);

    var command = matches[1];

    switch (command)
    {
    case 'card':
        return this.createCard(matches[2]);

    case 'show':
        return this.showCards(matches[2]);

    default:
        return P.resolve(this.help().usage);
    }
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
