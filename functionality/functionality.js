const fs = require("fs");
const path = require("path");
const measureExecutionTime = require('../helpers/executionTimeTracker');

module.exports = (function () {
    console.log("Loading functionality...");

    const normalizedCommandsPath = path.join(__dirname, "commands");
    const normalizedTriggersPath = path.join(__dirname, "triggers");
    const commands = [];
    const triggers = [];

    fs.readdirSync(normalizedCommandsPath).forEach(function (file) {
        measureExecutionTime(`Loading command ${file}`, () => {
            const command = require("./commands/" + file);
            commands.push(command);
        });
    });
    console.log("Loaded commands...");

    fs.readdirSync(normalizedTriggersPath).forEach(function (file) {
        measureExecutionTime(`Loading trigger ${file}`, () => {
            const trigger = require("./triggers/" + file);
            triggers.push(trigger);
        });
    });
    console.log("Loaded triggers...");

    return {
        commands,
        triggers
    }
})();