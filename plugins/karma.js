/*
Keep track of karma.

<person>++  - adds a karma point
<person>--  - removes a karma point
karma: person - adds a karma point

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

// TODO
