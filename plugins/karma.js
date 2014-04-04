/*
Keep track of karma.

<person>++  - adds a karma point
<person>--  - removes a karma point
karma: person - report
*/

var
    _      = require('lodash'),
    assert = require('assert')
    ;

var Karma = module.exports = function Karma(opts)
{
    assert(opts.brain, 'the karma plugin requires a brain for storage');

    this.brain = opts.brain;
};

Karma.prototype.brain = null;
Karma.prototype.pattern = /karma\s+(\w+)(\+\+|--)?|(\w+)(\+\+|--)/;

Karma.prototype.matches = function matches(msg)
{
    return this.pattern.test(msg);
};

Karma.prototype.respond = function respond(message)
{
    var matches = message.text.match(this.pattern);

    if (matches[1] === 'help') return message.done(this.help());

    var target = matches[1] || matches[3];
    var action = matches[2] || matches[4];

    if (!action)
        return this.report(target, message);

    if (action === '++')
        return this.give(target, message);

    if (action === '--')
        return this.take(target, message);

    message.done(this.help());
};

Karma.prototype.report = function report(target, message)
{
    // TODO report karma score for target
    message.done(target + 'has <UNKNOWN> karma because TBD');
};

Karma.prototype.give = function give(target, message)
{
    // TODO give karma to target
    message.done('Gave a karma point to ' + target + '!');
};

Karma.prototype.take = function take(target, message)
{
    // TODO take karma from target
    message.done('Took a karma point from ' + target + '.');
};

Karma.prototype.help = function help()
{
    return 'Keep track of karma.\n' +
    '<person>++  - adds a karma point\n' +
    '<person>--  - removes a karma point\n' +
    'karma: person - report current karma points';
};
