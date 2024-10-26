export default class CommandTriggerCheckResult {
    static get DontTriggerAndSkipCooldown() {
        return new CommandTriggerCheckResult(false, null, true);
    }
    static get DoNotTrigger() {
        return new CommandTriggerCheckResult(false, null, false);
    }

    shouldTrigger: boolean;
    matchResult: RegExpExecArray | null;
    skipCooldown: boolean;

    constructor(
        shouldTrigger: boolean,
        matchResult: RegExpExecArray | null,
        skipCooldown: boolean
    ) {
        this.shouldTrigger = shouldTrigger;
        this.matchResult = matchResult;
        this.skipCooldown = skipCooldown;
    }

    mergeWith(other: CommandTriggerCheckResult) {
        this.shouldTrigger = this.shouldTrigger || other.shouldTrigger;
        this.matchResult = this.matchResult || other.matchResult;
        this.skipCooldown = this.skipCooldown || other.skipCooldown;

        return this;
    }
}
