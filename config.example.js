module.exports =
{
    listen:  3000,
    env:     'dev',
    botname: 'hermione',
    token:   'slack-integration-token-here',
    hook:    'your-slack-incoming-webhook-uri-here',
    brain:
    {
        dbpath: './db'
    },
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
            station: '12th',
            tzOffset: 420,
        },
        npm: {},
        fastly: { apikey: 'your-key-here' },
        statuscats: {},
        pagerduty:
        {
            apikey:    'your-key-here',
            urlprefix: 'acme-inc'
        },
        deployer:
        {
            ansible: '/path/to/ansible-playbook',
            configdir: '/path/to/ansible/yml',
            playbooks:
            {
                'app-name': './playbooks/app-name.yml',
                another:  './playbooks/deploy-another.yml'
            },
            environments: ['production', 'staging', 'test', 'whatever']
        }
    }
};
