import { EXCLUDED_SPAN_PATTERNS } from './constants';

export function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

export function formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

export function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatDateTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export function formatLatency(ms: number): string {
    if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
}

/**
 * Severity bucket for a latency value, used to color-code duration/latency cells.
 */
export function getLatencyClass(ms: number): string {
    if (ms >= 5000) return 'latency-critical';
    if (ms >= 1000) return 'latency-high';
    if (ms >= 500) return 'latency-medium';
    return 'latency-low';
}

/**
 * Check if a span should be excluded from trace analysis.
 * Exported for use in multiple components.
 */
export function isExcludedSpan(operationName: string): boolean {
    return EXCLUDED_SPAN_PATTERNS.some((pattern) =>
        operationName.startsWith(pattern)
    );
}

/**
 * Calculate the actual trace duration from span end times.
 * This ensures consistent duration calculation across all components.
 * For each span, we calculate its end time as:
 * - If span has duration > 0: startTime + duration (most accurate)
 * - Else if endTime > 0: use endTime
 * - Else: use startTime (instant event)
 * Excludes certain span patterns (e.g., command.capture.*) from duration calculation.
 */
export function getTraceDuration(trace: {
    startTime: number;
    totalDuration?: number;
    spans: Array<{
        startTime: number;
        endTime?: number;
        duration?: number;
        operationName?: string;
    }>;
}): number {
    const filteredSpans = trace.spans.filter(
        (s) => !isExcludedSpan(s.operationName || '')
    );

    // If all spans are excluded, return 0
    if (filteredSpans.length === 0) {
        return 0;
    }

    const maxEndTime = Math.max(
        ...filteredSpans.map((s) => {
            // If span has a duration, use startTime + duration (most reliable)
            if (s.duration && s.duration > 0) {
                return s.startTime + s.duration;
            }
            // Otherwise use endTime if valid, or startTime for instant events
            return s.endTime && s.endTime > 0 ? s.endTime : s.startTime;
        })
    );
    const calculated = maxEndTime - trace.startTime;
    // Use the max of stored duration and calculated duration
    return Math.max(trace.totalDuration ?? calculated, calculated);
}

/**
 * Get the effective status of a trace.
 * If any spans are pending, the trace status is 'pending'.
 * Otherwise, use the root span status.
 */
export function getTraceStatus(trace: {
    traceId?: string;
    rootSpan: { status: string };
    spans: Array<{ status: string }>;
}): string {
    const hasPendingSpans = trace.spans.some((s) => s.status === 'pending');
    return hasPendingSpans ? 'pending' : trace.rootSpan.status;
}
