export default class CommandTriggerCheckResult {
    static get DontTriggerAndSkipCooldown() {
        return new CommandTriggerCheckResult(false, [], true);
    }
    static get DoNotTrigger() {
        return new CommandTriggerCheckResult(false, [], false);
    }

    shouldTrigger: boolean;
    matchResults: RegExpExecArray[];
    skipCooldown: boolean;

    constructor(
        shouldTrigger: boolean,
        matchResults: RegExpExecArray[],
        skipCooldown: boolean
    ) {
        this.shouldTrigger = shouldTrigger;
        this.matchResults = matchResults;
        this.skipCooldown = skipCooldown;
    }

    mergeWith(other: CommandTriggerCheckResult) {
        this.shouldTrigger = this.shouldTrigger || other.shouldTrigger;
        this.matchResults = this.matchResults.concat(other.matchResults);
        this.skipCooldown = this.skipCooldown || other.skipCooldown;

        return this;
    }
}
