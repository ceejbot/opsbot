module.exports =
{
    botname: 'hermione',
    token: 'slack-integration-token-here',
    hook: 'your-slack-incoming-webhook-uri-here',
    logging:
    {
        console: true,
        path: '/var/log'
    },
    plugins:
    {
        npm: {},
        fastly: { apikey: 'your-key-here' },
        statuscats: {},
        trello:
        {
            key:      'your-api-key',
            token:    'your-token',
            list:     'list-id-to-show',
            createIn: 'list-id-for-new-cards'
        },
    }
};
