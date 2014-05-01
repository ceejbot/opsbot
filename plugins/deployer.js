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
Deployer.prototype.pattern = /deploy\s+(\w+)$/;

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

    this.execute(matches[1], message);
};

Deployer.prototype.help = function help(msg)
{
    return 'Deploy www for a specific environment\n' +
        '`deploy [environment]` - deploy to the environment given\n';
};

Deployer.prototype.execute = function execute(environment, message)
{
    var ansible = this.spawn('unbuffer', ['ansible-playbook', this.playbook, '-i', environment], {
        cwd: this.ansibleFolder
    });

    message.send("deploying www to " + environment);

    ansible.stdout.on('data', function(data) {
        var output = data.toString();

        // Output either the top-level description of the play
        // being executed, or indicate when a play failed.
        ['***', 'ok=', 'fatal='].forEach(function(matcher) {
          if (outpout.indexOf(matcher) > -1) message.send(output.replace(/\*/g, ''));
        });
    });

    ansible.stderr.on('data', function(data) {
        message.send(data.toString());
    });

    ansible.on('close', function(code) {
        message.done("finished deploying www", environment);
    });
};
