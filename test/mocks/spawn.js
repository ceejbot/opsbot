module.exports = function(command) {
    return {
        on: function(listener, cb) {
            if (listener === 'close') {
                cb('close');
            }
        },
        stdout: {
            on: function(listener, cb) {
                cb('stdout');
            }
        },
        stderr: {
            on: function(listener, cb) {
                cb('stderr');
            }
        }
    }
};
