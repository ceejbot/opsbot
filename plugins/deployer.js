/*
Perform deployments with Ansible, and robots!
*/
var _ = require('lodash'),
    spawn = require('child_process').spawn;

var Deployer = module.exports = function Deployer(opts) {
    _.extend(this, {
        ansibleFolder: '/home/ubuntu/npm-ansible',
        playbook: './playbooks/deploy-www.yml'
    }, opts);

    if (!this.spawn) this.spawn = require('child_process').spawn;
};

Deployer.prototype.name = 'deployer';
Deployer.prototype.pattern = /deploy\s+(\w+)\s?(\w+)?$/;

Deployer.prototype.matches = function matches(msg)
{
    return this.pattern.test(msg);
};

Deployer.prototype.respond = function respond(message)
{
    var msg = message.text,
        matches = this.pattern.exec(msg);


    if (!matches || ['staging', 'production', 'development'].indexOf(matches[1]) == -1) {
        message.done(this.help());
        return;
    }

    this.execute(matches[1], matches[2] || 'HEAD', message);
};

Deployer.prototype.help = function help(msg)
{
    return 'Deploy www for a specific environment\n' +
        '`deploy [environment]` - deploy to the environment given\n';
};

Deployer.prototype.execute = function execute(environment, branch, message)
{
    var ansible = this.spawn('unbuffer', ['ansible-playbook', this.playbook, '-i', environment, '-e', 'npm_www_branch=' + branch], {
        cwd: this.ansibleFolder
    });

    message.send("deploying www to " + environment);

    ansible.stdout.on('data', function(data) {
        message.send(data.toString().replace(/\*/g, ''));
    });

    ansible.stderr.on('data', function(data) {
        message.send(data.toString());
    });

    ansible.on('close', function(code) {
        message.done("finished deploying www", environment);
    });
};
