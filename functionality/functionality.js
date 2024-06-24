const triggers = require('./gen_triggers');
const commands = require('./gen_commands');

module.exports = (function () {
    console.log("Loading functionality...");

    return {
        commands,
        triggers
    }
})();