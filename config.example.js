module.exports =
{
    listen:  3000,
    env:     'dev',
    botname: 'hermione',
    token:   'slack-integration-token-here',
    hook:    'your-slack-incoming-webhook-uri-here',
    logging:
    {
        console: true,
        path: '/var/log'
    },
    plugins:
    {
        bartly:
        {
            apikey: 'your-bart-api-key',
            station: '12th'
        },
        npm: {},
        fastly: { apikey: 'your-key-here' },
        statuscats: {},
        trello:
        {
            key:      'your-api-key',
            token:    'your-token',
            board:    'board-id',
            list:     'list-id-to-show',
            createIn: 'list-id-for-new-cards'
        },
        pagerduty:
        {
            apikey:    'your-key-here',
            urlprefix: 'acme-inc'
        },
    }
};
