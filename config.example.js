module.exports =
{
    botname: 'hermione',
    token: 'required-token-here',
    logging:
    {
        console: true,
        path: '/var/log'
    },
    plugins:
    {
        npm: {},
        fastly: { apikey: 'my-key-here' },
    }
};
