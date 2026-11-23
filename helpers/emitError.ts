import { ObservabilityHelper } from '../types/observabilityHelper';

/**
 * Appends the cause's message, since monitoring only reads the top-level message.
 */
export function wrapError(message: string, cause: unknown) {
    return new Error(
        `${message}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause }
    );
}

export function emitError(
    observability: ObservabilityHelper,
    message: string,
    cause?: unknown
) {
    observability.emitter.emit('error.generic', {
        traceId: observability.traceId,
        error:
            cause === undefined ? new Error(message) : wrapError(message, cause)
    });
}
