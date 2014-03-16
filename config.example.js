module.exports =
{
    botname: 'hermione',
    token: 'slack-integration-token-here',
    logging:
    {
        console: true,
        path: '/var/log'
    },
    plugins:
    {
        npm: {},
        fastly: { apikey: 'my-key-here' },
        statuscats: {},
    }
};
