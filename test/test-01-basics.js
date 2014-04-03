'use strict';

var
    lab      = require('lab'),
    describe = lab.describe,
    it       = lab.it,
    demand   = require('must')
    ;

describe('server', function()
{
    it('can be constructed');
    it('can be configured');
    it('responds on /ping');
    it('responds on /message');
    it('posts responses to the provided webhook');
    it('does not leak messages or other objects per request');
});
