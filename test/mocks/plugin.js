var MockPlugin = module.exports = function MockPlugin() { };

MockPlugin.prototype.name = 'mock-plugin';

MockPlugin.prototype.matches = function matches(msg)
{
    return msg.match(/^mock/);
};

MockPlugin.prototype.respond = function respond(message)
{
    switch (message.text)
    {
    case 'mock one':
        return this.testOne(message);

    case 'mock two':
        return this.testTwo(message);
    }
};

MockPlugin.prototype.testOne = function testOne(msg)
{
    msg.done('test one');
};

MockPlugin.prototype.testTwo = function testTwo(msg)
{
    msg.send('test two');
    msg.done();
};

MockPlugin.prototype.help = function help()
{
    return 'this is a mock plugin for testing purposes';
};
