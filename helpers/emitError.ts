import { ObservabilityHelper } from '../types/observabilityHelper';

/**
 * Emits `error.generic` on the current trace. With a `cause`, its message is appended to `message`
 * (so monitoring, which only reads the top-level message, still sees it) and the cause itself is
 * attached for its stack.
 */
export function emitError(
    observability: ObservabilityHelper,
    message: string,
    cause?: unknown
) {
    const fullMessage =
        cause === undefined
            ? message
            : `${message}: ${cause instanceof Error ? cause.message : String(cause)}`;

    observability.emitter.emit('error.generic', {
        traceId: observability.traceId,
        error: new Error(fullMessage, { cause })
    });
}
