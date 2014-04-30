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
Deployer.prototype.pattern = /deployer\s+(\w+)$/;

Deployer.prototype.matches = function matches(msg)
{
    return this.pattern.test(msg);
};

Deployer.prototype.respond = function respond(message)
{
    var msg = message.text,
        matches = this.pattern.exec(msg);

    if (!matches) {
        message.done(this.help());
        return;
    }

    var environment = matches[1];

    this.execute(environment, message);
};

Deployer.prototype.help = function help(msg)
{
    return 'Deploy www for a specific environment\n' +
        '`deployer [environment]` - deploy to the enviornment given\n';
};

Deployer.prototype.execute = function execute(environment, message)
{
    var spawn = require('child_process').spawn,
        ansible = spawn('ansible-playbook', [this.playbook, '-i', environment], {
            cwd: this.ansibleFolder
        });

    message.send("deploying www to" + environment);

    ansible.stdout.on('data', function(data) {
        message.send(data.toString());
    });

    ansible.stderr.on('data', function(data) {
        message.send(data.toString());
    });

    ansible.on('close', function(code) {
        message.done("finished deploying www", environment);
    });
};
