module.exports = function(command) {
    return {
        on: function(listener, cb) {
            if (listener === 'close') {
                cb();
            }
        }
    }
};
