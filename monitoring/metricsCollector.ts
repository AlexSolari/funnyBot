import { randomUUID } from 'crypto';
import {
    Trace,
    TraceSpan,
    ThroughputMetrics,
    LatencyMetrics,
    CurrentStats,
    DashboardData,
    LatencyHistogramBucket,
    TraceSearchQuery,
    HeaviestCommand
} from './types';

// Ring buffer for efficient fixed-size storage
class RingBuffer<T> {
    private buffer: T[];
    private head = 0;
    private size = 0;

    constructor(private readonly capacity: number) {
        this.buffer = new Array(capacity);
    }

    push(item: T): void {
        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.capacity;
        if (this.size < this.capacity) this.size++;
    }

    toArray(): T[] {
        if (this.size < this.capacity) {
            return this.buffer.slice(0, this.size);
        }
        return [
            ...this.buffer.slice(this.head),
            ...this.buffer.slice(0, this.head)
        ];
    }

    getRecent(n: number): T[] {
        const arr = this.toArray();
        return arr.slice(-n);
    }

    clear(): void {
        this.buffer = new Array(this.capacity);
        this.head = 0;
        this.size = 0;
    }

    get length(): number {
        return this.size;
    }
}

// Time-series bucket for aggregating metrics per minute
interface TimeBucket {
    timestamp: number;
    count: number;
}

class TimeSeriesCounter {
    private readonly buckets: Map<number, number> = new Map();
    private readonly bucketSizeMs: number;
    private readonly maxBuckets: number;

    constructor(bucketSizeMs = 60000, maxBuckets = 60) {
        this.bucketSizeMs = bucketSizeMs;
        this.maxBuckets = maxBuckets;
    }

    increment(timestamp: number = Date.now()): void {
        const bucketKey =
            Math.floor(timestamp / this.bucketSizeMs) * this.bucketSizeMs;
        this.buckets.set(bucketKey, (this.buckets.get(bucketKey) || 0) + 1);
        this.cleanup();
    }

    private cleanup(): void {
        const cutoff = Date.now() - this.bucketSizeMs * this.maxBuckets;
        for (const key of this.buckets.keys()) {
            if (key < cutoff) {
                this.buckets.delete(key);
            }
        }
    }

    getPoints(): TimeBucket[] {
        const now = Date.now();
        const result: TimeBucket[] = [];

        for (let i = this.maxBuckets - 1; i >= 0; i--) {
            const bucketKey =
                Math.floor((now - i * this.bucketSizeMs) / this.bucketSizeMs) *
                this.bucketSizeMs;
            result.push({
                timestamp: bucketKey,
                count: this.buckets.get(bucketKey) || 0
            });
        }

        return result;
    }

    getTotal(): number {
        let total = 0;
        for (const count of this.buckets.values()) {
            total += count;
        }
        return total;
    }
}

export class MetricsCollector {
    private readonly startTime: number = Date.now();
    private readonly botNames: Set<string> = new Set();

    // Trace storage
    private readonly traces: Map<string, Trace> = new Map();
    private readonly traceRing: RingBuffer<Trace> = new RingBuffer(1000);
    private readonly pendingSpans: Map<string, TraceSpan> = new Map();

    // Throughput counters
    private readonly messagesReceived = new TimeSeriesCounter();
    private readonly commandsExecuted = new TimeSeriesCounter();
    private readonly inlineQueriesProcessed = new TimeSeriesCounter();
    private readonly scheduledTasksRun = new TimeSeriesCounter();
    private readonly apiRequestsSent = new TimeSeriesCounter();
    private readonly errorsCount = new TimeSeriesCounter();

    // Latency storage (keep last N samples)
    // Note: Message latencies are now calculated from traces via getTraceBasedLatencies()
    private readonly commandLatencies: Map<string, RingBuffer<number>> =
        new Map();
    private readonly inlineLatencies = new RingBuffer<number>(1000);
    private readonly scheduledLatencies: Map<string, RingBuffer<number>> =
        new Map();
    private readonly apiLatencies = new RingBuffer<number>(1000);

    // Error storage
    private readonly recentErrors = new RingBuffer<{
        timestamp: number;
        message: string;
        name: string;
        traceId?: string;
    }>(100);

    // Active processing tracking for latency calculation
    private readonly messageProcessingStart: Map<string, number> = new Map();
    private readonly commandExecutionStart: Map<
        string,
        { timestamp: number; actionName: string }
    > = new Map();
    private readonly inlineProcessingStart: Map<string, number> = new Map();
    private readonly scheduledExecutionStart: Map<
        string,
        { timestamp: number; actionName: string }
    > = new Map();
    private readonly apiRequestStart: Map<string, number> = new Map();

    registerBot(botName: string): void {
        this.botNames.add(botName);
    }

    // Generate unique keys for tracking
    private generateKey(): string {
        return randomUUID();
    }

    // Trace management
    startTrace(
        botName: string,
        operationType: Trace['operationType'],
        operationName: string,
        tags: Record<string, string | number | boolean> = {}
    ): string {
        const traceId = randomUUID();
        return this.startTraceWithId(
            traceId,
            botName,
            operationType,
            operationName,
            tags
        );
    }

    startTraceWithId(
        traceId: string,
        botName: string,
        operationType: Trace['operationType'],
        operationName: string,
        tags: Record<string, string | number | boolean> = {}
    ): string {
        // Check if trace already exists - if so, add a span instead
        const existingTrace = this.traces.get(traceId);
        if (existingTrace) {
            // Add a new span to the existing trace
            const spanId = randomUUID();
            const span: TraceSpan = {
                traceId,
                spanId,
                parentSpanId: existingTrace.rootSpan.spanId,
                operationName,
                startTime: Date.now(),
                tags: { botName, ...tags },
                logs: [],
                status: 'pending'
            };
            existingTrace.spans.push(span);
            this.pendingSpans.set(spanId, span);
            return traceId;
        }

        const spanId = randomUUID();
        const now = Date.now();

        const rootSpan: TraceSpan = {
            traceId,
            spanId,
            operationName,
            startTime: now,
            tags: { botName, ...tags },
            logs: [],
            status: 'pending'
        };

        const trace: Trace = {
            traceId,
            rootSpan,
            spans: [rootSpan],
            startTime: now,
            botName,
            operationType
        };

        this.traces.set(traceId, trace);
        this.pendingSpans.set(spanId, rootSpan);

        return traceId;
    }

    addSpan(
        traceId: string,
        operationName: string,
        parentSpanId?: string,
        tags: Record<string, string | number | boolean> = {}
    ): string | null {
        const trace = this.traces.get(traceId);
        if (!trace) return null;

        const spanId = randomUUID();
        const span: TraceSpan = {
            traceId,
            spanId,
            parentSpanId: parentSpanId || trace.rootSpan.spanId,
            operationName,
            startTime: Date.now(),
            tags,
            logs: [],
            status: 'pending'
        };

        trace.spans.push(span);
        this.pendingSpans.set(spanId, span);

        return spanId;
    }

    endSpan(spanId: string, status: 'success' | 'error' = 'success'): void {
        const span = this.pendingSpans.get(spanId);
        if (!span) return;

        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.status = status;
        this.pendingSpans.delete(spanId);
    }

    endTrace(traceId: string, status: 'success' | 'error' = 'success'): void {
        const trace = this.traces.get(traceId);
        if (!trace) return;

        const now = Date.now();

        // Calculate actual end time based on the latest span end time
        // This ensures we capture async operations that complete after message processing
        // For each span: if it has duration, use startTime + duration; else use endTime or startTime
        const latestSpanEndTime = Math.max(
            now,
            ...trace.spans.map((s) => {
                if (s.duration && s.duration > 0) {
                    return s.startTime + s.duration;
                }
                return s.endTime && s.endTime > 0 ? s.endTime : s.startTime;
            })
        );

        trace.endTime = latestSpanEndTime;
        trace.totalDuration = latestSpanEndTime - trace.startTime;
        trace.rootSpan.endTime = latestSpanEndTime;
        trace.rootSpan.duration = trace.totalDuration;
        trace.rootSpan.status = status;

        // Move to ring buffer and remove from active map
        this.traceRing.push(trace);

        // Keep in map for a short time for lookups, then clean up
        setTimeout(() => {
            this.traces.delete(traceId);
        }, 60000);
    }

    logToTrace(traceId: string, message: string): void {
        const trace = this.traces.get(traceId);
        if (trace) {
            trace.rootSpan.logs.push({ timestamp: Date.now(), message });
        }
    }

    // Start a span that will be completed by onSpanEnd
    // Returns spanId for correlation
    onSpanStart(
        traceId: string | undefined,
        botName: string,
        operationType: Trace['operationType'],
        spanName: string,
        tags: Record<string, string | number | boolean> = {},
        messagePreview?: string
    ): string | undefined {
        if (!traceId) return undefined;

        const spanId = randomUUID();
        const now = Date.now();

        // Check if trace exists in active map first, then in ring buffer
        let existingTrace = this.traces.get(traceId);
        if (!existingTrace) {
            // Look in the ring buffer for completed traces
            const completedTraces = this.traceRing.toArray();
            existingTrace = completedTraces.find((t) => t.traceId === traceId);
        }

        if (existingTrace) {
            // Add a new span to the existing trace (without endTime/duration yet)
            const span: TraceSpan = {
                traceId,
                spanId,
                parentSpanId: existingTrace.rootSpan.spanId,
                operationName: spanName,
                startTime: now,
                endTime: 0,
                duration: 0,
                tags: { botName, ...tags },
                logs: [],
                status: 'pending' as TraceSpan['status']
            };
            existingTrace.spans.push(span);
            if (messagePreview && !existingTrace.messagePreview) {
                existingTrace.messagePreview = messagePreview;
            }
        } else {
            // Create new trace with this span as root
            const rootSpan: TraceSpan = {
                traceId,
                spanId,
                operationName: spanName,
                startTime: now,
                endTime: 0,
                duration: 0,
                tags: { botName, ...tags },
                logs: [],
                status: 'pending' as TraceSpan['status']
            };

            const trace: Trace = {
                traceId,
                rootSpan,
                spans: [rootSpan],
                startTime: now,
                botName,
                operationType,
                messagePreview
            };

            this.traces.set(traceId, trace);
        }

        return spanId;
    }

    // Complete a span started by onSpanStart
    onSpanEnd(
        traceId: string | undefined,
        spanName: string,
        status: 'success' | 'error' = 'success',
        additionalTags: Record<string, string | number | boolean> = {}
    ): void {
        if (!traceId) return;

        // Try to find trace in active map first, then in ring buffer
        let trace = this.traces.get(traceId);
        let isCompletedTrace = false;

        if (!trace) {
            // Look in the ring buffer for completed traces
            const completedTraces = this.traceRing.toArray();
            trace = completedTraces.find((t) => t.traceId === traceId);
            isCompletedTrace = true;
        }

        if (!trace) return;

        // Find the most recent span with matching name that hasn't been completed
        for (let i = trace.spans.length - 1; i >= 0; i--) {
            const span = trace.spans[i];
            if (span.operationName === spanName && span.endTime === 0) {
                const now = Date.now();
                span.endTime = now;
                span.duration = now - span.startTime;
                span.status = status;
                Object.assign(span.tags, additionalTags);

                // If this span ends after the trace's recorded end time, update the trace duration
                if (isCompletedTrace && trace.endTime && now > trace.endTime) {
                    trace.endTime = now;
                    trace.totalDuration = now - trace.startTime;
                    trace.rootSpan.endTime = now;
                    trace.rootSpan.duration = trace.totalDuration;
                }
                break;
            }
        }
    }

    // Generic event handler - adds a span to a trace
    onEvent(
        traceId: string | undefined,
        botName: string,
        operationType: Trace['operationType'],
        eventName: string,
        tags: Record<string, string | number | boolean> = {},
        messagePreview?: string
    ): void {
        if (!traceId) return;

        // Check if trace exists
        const existingTrace = this.traces.get(traceId);
        if (existingTrace) {
            // Add a new span to the existing trace
            const spanId = randomUUID();
            const now = Date.now();
            const span: TraceSpan = {
                traceId,
                spanId,
                parentSpanId: existingTrace.rootSpan.spanId,
                operationName: eventName,
                startTime: now,
                endTime: now,
                duration: 0,
                tags: { botName, ...tags },
                logs: [],
                status: 'success'
            };
            existingTrace.spans.push(span);
            // Update messagePreview if provided and not already set
            if (messagePreview && !existingTrace.messagePreview) {
                existingTrace.messagePreview = messagePreview;
            }
        } else {
            // Create new trace with this event as root
            const spanId = randomUUID();
            const now = Date.now();

            const rootSpan: TraceSpan = {
                traceId,
                spanId,
                operationName: eventName,
                startTime: now,
                endTime: now,
                duration: 0,
                tags: { botName, ...tags },
                logs: [],
                status: 'success'
            };

            const trace: Trace = {
                traceId,
                rootSpan,
                spans: [rootSpan],
                startTime: now,
                botName,
                operationType,
                messagePreview
            };

            this.traces.set(traceId, trace);
        }
    }

    // Event handlers for metrics tracking (separate from span tracking)
    onMessageReceived(botName: string, messageId: number): void {
        this.messagesReceived.increment();
        const key = `${botName}:${messageId}`;
        this.messageProcessingStart.set(key, Date.now());
    }

    onMessageProcessingFinished(
        botName: string,
        messageId: number,
        traceId?: string
    ): void {
        const key = `${botName}:${messageId}`;
        this.messageProcessingStart.delete(key);

        if (traceId) {
            this.endTrace(traceId, 'success');
        }
    }

    onCommandExecuting(
        botName: string,
        actionName: string,
        messageId: number
    ): void {
        const key = `${botName}:${actionName}:${messageId}`;
        this.commandExecutionStart.set(key, {
            timestamp: Date.now(),
            actionName
        });
    }

    onCommandExecuted(
        botName: string,
        actionName: string,
        messageId: number
    ): void {
        const key = `${botName}:${actionName}:${messageId}`;
        const startInfo = this.commandExecutionStart.get(key);
        if (startInfo) {
            const latency = Date.now() - startInfo.timestamp;

            if (!this.commandLatencies.has(actionName)) {
                this.commandLatencies.set(actionName, new RingBuffer(100));
            }
            this.commandLatencies.get(actionName)!.push(latency);
            this.commandExecutionStart.delete(key);
        }

        this.commandsExecuted.increment();
    }

    onInlineQueryReceived(botName: string, queryId: string): void {
        this.inlineQueriesProcessed.increment();
        const key = `${botName}:${queryId}`;
        this.inlineProcessingStart.set(key, Date.now());
    }

    onInlineQueryFinished(
        botName: string,
        queryId: string,
        traceId?: string
    ): void {
        const key = `${botName}:${queryId}`;
        const startTime = this.inlineProcessingStart.get(key);
        if (startTime) {
            const latency = Date.now() - startTime;
            this.inlineLatencies.push(latency);
            this.inlineProcessingStart.delete(key);
        }

        if (traceId) {
            this.endTrace(traceId, 'success');
        }
    }

    onScheduledActionExecuting(botName: string, actionName: string): void {
        const key = `${botName}:${actionName}:${Date.now()}`;
        this.scheduledExecutionStart.set(key, {
            timestamp: Date.now(),
            actionName
        });
    }

    onScheduledActionExecuted(
        botName: string,
        actionName: string,
        traceId?: string
    ): void {
        // Find matching start
        for (const [key, info] of this.scheduledExecutionStart.entries()) {
            if (
                key.startsWith(`${botName}:${actionName}:`) &&
                info.actionName === actionName
            ) {
                const latency = Date.now() - info.timestamp;

                if (!this.scheduledLatencies.has(actionName)) {
                    this.scheduledLatencies.set(
                        actionName,
                        new RingBuffer(100)
                    );
                }
                this.scheduledLatencies.get(actionName)!.push(latency);
                this.scheduledExecutionStart.delete(key);
                break;
            }
        }

        this.scheduledTasksRun.increment();

        if (traceId) {
            this.endTrace(traceId, 'success');
        }
    }

    onApiRequestSending(traceId?: string): void {
        if (traceId) {
            this.apiRequestStart.set(traceId, Date.now());
        }
    }

    onApiRequestSent(traceId?: string): void {
        if (traceId) {
            const startTime = this.apiRequestStart.get(traceId);
            if (startTime) {
                const latency = Date.now() - startTime;
                this.apiLatencies.push(latency);
                this.apiRequestStart.delete(traceId);
            }
        }

        this.apiRequestsSent.increment();
    }

    onError(message: string, name: string, traceId?: string): void {
        this.errorsCount.increment();
        this.recentErrors.push({
            timestamp: Date.now(),
            message,
            name,
            traceId
        });

        if (traceId) {
            this.logToTrace(traceId, `Error: ${name} - ${message}`);
            this.endTrace(traceId, 'error');
        }
    }

    // Statistics calculation
    private calculatePercentile(values: number[], percentile: number): number {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    private calculateAverage(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    /**
     * Calculate the actual span duration.
     * Uses duration if available, otherwise calculates from endTime - startTime.
     * For pending spans, calculates from current time.
     */
    private getSpanDuration(span: TraceSpan): number {
        // If span has a valid duration, use it
        if (span.duration && span.duration > 0) {
            return span.duration;
        }
        // If span has a valid endTime, calculate duration
        if (span.endTime && span.endTime > 0 && span.endTime > span.startTime) {
            return span.endTime - span.startTime;
        }
        // For pending spans, return 0 (don't include in calculations)
        return 0;
    }

    /**
     * Calculate the actual trace duration from span end times.
     * This ensures consistent duration calculation across all components.
     */
    private getTraceDuration(trace: Trace): number {
        const maxEndTime = Math.max(
            ...trace.spans.map((s) => {
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

    private buildLatencyHistogram(values: number[]): LatencyHistogramBucket[] {
        const buckets = [
            10,
            25,
            50,
            100,
            250,
            500,
            1000,
            2500,
            5000,
            10000,
            Infinity
        ];
        return buckets.map((le) => ({
            le,
            count: values.filter((v) => v <= le).length
        }));
    }

    getCurrentStats(): CurrentStats {
        // Use trace-based latencies for message latency stats (consistent with other metrics)
        const messageLatencyValues = this.getTraceBasedLatencies();
        const commandLatencyValues: number[] = [];
        for (const buffer of this.commandLatencies.values()) {
            commandLatencyValues.push(...buffer.toArray());
        }
        const inlineLatencyValues = this.inlineLatencies.toArray();

        return {
            uptime: Date.now() - this.startTime,
            totalMessagesReceived: this.messagesReceived.getTotal(),
            totalCommandsExecuted: this.commandsExecuted.getTotal(),
            totalInlineQueries: this.inlineQueriesProcessed.getTotal(),
            totalScheduledTasks: this.scheduledTasksRun.getTotal(),
            totalApiRequests: this.apiRequestsSent.getTotal(),
            totalErrors: this.errorsCount.getTotal(),
            activeTraces: this.traces.size,
            avgMessageLatency: this.calculateAverage(messageLatencyValues),
            avgCommandLatency: this.calculateAverage(commandLatencyValues),
            avgInlineLatency: this.calculateAverage(inlineLatencyValues),
            p50MessageLatency: this.calculatePercentile(
                messageLatencyValues,
                50
            ),
            p95MessageLatency: this.calculatePercentile(
                messageLatencyValues,
                95
            ),
            p99MessageLatency: this.calculatePercentile(
                messageLatencyValues,
                99
            )
        };
    }

    getThroughputMetrics(): ThroughputMetrics {
        return {
            messagesReceived: this.messagesReceived.getPoints().map((p) => ({
                timestamp: p.timestamp,
                value: p.count
            })),
            commandsExecuted: this.commandsExecuted.getPoints().map((p) => ({
                timestamp: p.timestamp,
                value: p.count
            })),
            inlineQueriesProcessed: this.inlineQueriesProcessed
                .getPoints()
                .map((p) => ({
                    timestamp: p.timestamp,
                    value: p.count
                })),
            scheduledTasksRun: this.scheduledTasksRun.getPoints().map((p) => ({
                timestamp: p.timestamp,
                value: p.count
            })),
            apiRequestsSent: this.apiRequestsSent.getPoints().map((p) => ({
                timestamp: p.timestamp,
                value: p.count
            })),
            errors: this.errorsCount.getPoints().map((p) => ({
                timestamp: p.timestamp,
                value: p.count
            })),
            avgLatency: this.getAvgLatencyPoints()
        };
    }

    private getAvgLatencyPoints(): Array<{ timestamp: number; value: number }> {
        const now = Date.now();
        const bucketSizeMs = 60000;
        const maxBuckets = 60;
        const result: Array<{ timestamp: number; value: number }> = [];

        // Group completed traces by time bucket and calculate avg latency per bucket
        const allTraces = this.traceRing.toArray();
        const bucketData: Map<number, { sum: number; count: number }> =
            new Map();

        for (const trace of allTraces) {
            const duration = this.getTraceDuration(trace);
            if (duration <= 0) continue;

            const bucketKey =
                Math.floor(trace.startTime / bucketSizeMs) * bucketSizeMs;
            const existing = bucketData.get(bucketKey) || { sum: 0, count: 0 };
            existing.sum += duration;
            existing.count += 1;
            bucketData.set(bucketKey, existing);
        }

        for (let i = maxBuckets - 1; i >= 0; i--) {
            const bucketKey =
                Math.floor((now - i * bucketSizeMs) / bucketSizeMs) *
                bucketSizeMs;
            const bucket = bucketData.get(bucketKey);
            const avg =
                bucket && bucket.count > 0 ? bucket.sum / bucket.count : 0;
            result.push({ timestamp: bucketKey, value: Math.round(avg) });
        }

        return result;
    }

    getLatencyMetrics(): LatencyMetrics {
        const commandExecution: Record<string, number[]> = {};
        for (const [name, buffer] of this.commandLatencies) {
            commandExecution[name] = buffer.toArray();
        }

        const scheduledTaskExecution: Record<string, number[]> = {};
        for (const [name, buffer] of this.scheduledLatencies) {
            scheduledTaskExecution[name] = buffer.toArray();
        }

        return {
            messageProcessing: this.getTraceBasedLatencies(),
            commandExecution,
            inlineQueryProcessing: this.inlineLatencies.toArray(),
            scheduledTaskExecution,
            apiRequests: this.apiLatencies.toArray()
        };
    }

    searchTraces(query: TraceSearchQuery): Trace[] {
        let traces = this.traceRing.toArray();

        // Also include active traces
        traces = [...traces, ...this.traces.values()];

        // Deduplicate by traceId - keep the most complete version (latest)
        const traceMap = new Map<string, Trace>();
        for (const trace of traces) {
            const existing = traceMap.get(trace.traceId);
            if (!existing || trace.spans.length > existing.spans.length) {
                traceMap.set(trace.traceId, trace);
            }
        }
        traces = [...traceMap.values()];

        if (query.traceId) {
            traces = traces.filter((t) =>
                t.traceId.toLowerCase().includes(query.traceId!.toLowerCase())
            );
        }

        if (query.botName) {
            traces = traces.filter((t) => t.botName === query.botName);
        }

        if (query.operationType) {
            traces = traces.filter(
                (t) => t.operationType === query.operationType
            );
        }

        if (query.minDuration !== undefined) {
            traces = traces.filter(
                (t) =>
                    t.totalDuration !== undefined &&
                    t.totalDuration >= query.minDuration!
            );
        }

        if (query.maxDuration !== undefined) {
            traces = traces.filter(
                (t) =>
                    t.totalDuration !== undefined &&
                    t.totalDuration <= query.maxDuration!
            );
        }

        if (query.status) {
            traces = traces.filter((t) => t.rootSpan.status === query.status);
        }

        if (query.fromTime !== undefined) {
            traces = traces.filter((t) => t.startTime >= query.fromTime!);
        }

        if (query.toTime !== undefined) {
            traces = traces.filter((t) => t.startTime <= query.toTime!);
        }

        // Sort by start time descending
        traces.sort((a, b) => b.startTime - a.startTime);

        if (query.limit) {
            traces = traces.slice(0, query.limit);
        }

        return traces;
    }

    getTraceById(traceId: string): Trace | undefined {
        // Check active traces first
        const active = this.traces.get(traceId);

        // Then check completed traces
        const completed = this.traceRing
            .toArray()
            .find((t) => t.traceId === traceId);

        // Return the one with more spans (more complete)
        if (active && completed) {
            return active.spans.length >= completed.spans.length
                ? active
                : completed;
        }

        return active || completed;
    }

    // Get top 10 heaviest commands by average latency from recent traces
    getTopHeaviestCommands(limit: number = 10): HeaviestCommand[] {
        const commandStats: Map<
            string,
            {
                latencies: number[];
                traceIds: Set<string>;
            }
        > = new Map();

        // Gather all traces (both active and completed)
        const allTraces = [
            ...this.traces.values(),
            ...this.traceRing.toArray()
        ];

        // Analyze each trace for command spans
        for (const trace of allTraces) {
            this.collectCommandSpanLatencies(trace, commandStats);
        }

        return this.buildHeaviestCommandsResult(commandStats, limit);
    }

    private collectCommandSpanLatencies(
        trace: Trace,
        commandStats: Map<
            string,
            { latencies: number[]; traceIds: Set<string> }
        >
    ): void {
        for (const span of trace.spans) {
            // Look for command action spans (command.action.*, reply.action.*)
            if (
                !span.operationName.startsWith('command.action.') &&
                !span.operationName.startsWith('reply.action.')
            ) {
                continue;
            }

            const actionName =
                (span.tags.actionName as string) ||
                span.operationName.split('.').pop() ||
                'unknown';

            // Calculate duration consistently using helper
            const duration = this.getSpanDuration(span);
            if (duration <= 0) continue;

            if (!commandStats.has(actionName)) {
                commandStats.set(actionName, {
                    latencies: [],
                    traceIds: new Set()
                });
            }
            const stats = commandStats.get(actionName)!;
            stats.latencies.push(duration);
            stats.traceIds.add(trace.traceId);
        }
    }

    private buildHeaviestCommandsResult(
        commandStats: Map<
            string,
            { latencies: number[]; traceIds: Set<string> }
        >,
        limit: number
    ): HeaviestCommand[] {
        const results: HeaviestCommand[] = [];

        for (const [actionName, stats] of commandStats) {
            if (stats.latencies.length === 0) continue;

            const sum = stats.latencies.reduce((a, b) => a + b, 0);
            const avgLatency = sum / stats.latencies.length;
            const maxLatency = Math.max(...stats.latencies);

            results.push({
                actionName,
                avgLatency: Math.round(avgLatency),
                maxLatency,
                count: stats.latencies.length,
                traceIds: [...stats.traceIds].slice(0, 5)
            });
        }

        // Sort by average latency descending
        results.sort((a, b) => b.avgLatency - a.avgLatency);

        return results.slice(0, limit);
    }

    /**
     * Get latencies from completed traces for histogram.
     * Uses the same duration calculation as the frontend.
     */
    private getTraceBasedLatencies(): number[] {
        const latencies: number[] = [];

        // Get completed traces from ring buffer
        for (const trace of this.traceRing.toArray()) {
            const duration = this.getTraceDuration(trace);
            if (duration > 0) {
                latencies.push(duration);
            }
        }

        // Also include completed active traces (those with all spans done)
        for (const trace of this.traces.values()) {
            const hasPendingSpans = trace.spans.some(
                (s) => s.status === 'pending'
            );
            if (
                !hasPendingSpans &&
                trace.totalDuration &&
                trace.totalDuration > 0
            ) {
                const duration = this.getTraceDuration(trace);
                if (duration > 0) {
                    latencies.push(duration);
                }
            }
        }

        return latencies;
    }

    getDashboardData(): DashboardData {
        // Use trace-based latencies for histogram (consistent with frontend)
        const traceLatencies = this.getTraceBasedLatencies();

        return {
            currentStats: this.getCurrentStats(),
            throughput: this.getThroughputMetrics(),
            latencyHistogram: this.buildLatencyHistogram(traceLatencies),
            recentTraces: this.searchTraces({ limit: 50 }),
            recentErrors: this.recentErrors.toArray().reverse(),
            botNames: [...this.botNames],
            topHeaviestCommands: this.getTopHeaviestCommands(10)
        };
    }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();
