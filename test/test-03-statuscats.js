/*global describe:true, it:true, before:true, after:true */

var
    demand     = require('must'),
    StatusCats = require('../plugins/statuscats')
    ;

describe('StatusCats', function()
{
    it('can be constructed', function()
    {
        var plugin = new StatusCats();
        plugin.must.be.truthy();
        plugin.must.have.property('help');
		plugin.help.must.be.a.function();
        plugin.must.have.property('matches');
		plugin.matches.must.be.a.function();
        plugin.must.have.property('respond');
		plugin.respond.must.be.a.function();
    });

    it('implements help() correctly', function()
    {
        var plugin = new StatusCats();
        var help = plugin.help();
        help.must.be.a.string();
        help.length.must.be.above(0);
    });

    it('implements matches() correctly', function()
    {
        var plugin = new StatusCats();
        plugin.matches('NOT VALID').must.be.false();
        plugin.matches('statuscat').must.be.true();
        plugin.matches('statuscat 404').must.be.true();
        plugin.matches('statuscat 404    ').must.be.true();
    });

    it('implements respond() correctly', function(done)
    {
        var plugin = new StatusCats();
        plugin.respond('statuscat 404', function(err, response)
        {
            demand(err).be.null();
            response.must.be.a.string();
            done();
        });
    });

    it('responds with the help message for malformed statuses', function(done)
    {
        var plugin = new StatusCats();
        plugin.respond('statuscat asdf', function(err, response)
        {
            demand(err).be.null();
            response.must.be.a.string();
            response.match(/Usage:/).must.be.truthy();
            done();
        });
    });

    it('responds with a status cat url', function(done)
    {
        var plugin = new StatusCats();
        plugin.respond('statuscat 404', function(err, response)
        {
            demand(err).be.null();
            response.must.be.a.string();
            response.must.equal('http://httpcats.herokuapp.com/404');
            done();
        });
    });
});
