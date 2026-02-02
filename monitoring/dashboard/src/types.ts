export interface TraceSpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    tags: Record<string, string | number | boolean>;
    logs: Array<{ timestamp: number; message: string }>;
    status: 'pending' | 'success' | 'error';
}

export interface Trace {
    traceId: string;
    rootSpan: TraceSpan;
    spans: TraceSpan[];
    startTime: number;
    endTime?: number;
    totalDuration?: number;
    botName: string;
    operationType: 'message' | 'command' | 'inline' | 'scheduled' | 'api';
    messagePreview?: string;
}

export interface MetricPoint {
    timestamp: number;
    value: number;
}

export interface LatencyHistogramBucket {
    le: number;
    count: number;
}

export interface ThroughputMetrics {
    messagesReceived: MetricPoint[];
    commandsExecuted: MetricPoint[];
    inlineQueriesProcessed: MetricPoint[];
    scheduledTasksRun: MetricPoint[];
    apiRequestsSent: MetricPoint[];
    errors: MetricPoint[];
    avgLatency: MetricPoint[];
}

export interface CurrentStats {
    uptime: number;
    totalMessagesReceived: number;
    totalCommandsExecuted: number;
    totalInlineQueries: number;
    totalScheduledTasks: number;
    totalApiRequests: number;
    totalErrors: number;
    activeTraces: number;
    avgMessageLatency: number;
    avgCommandLatency: number;
    avgInlineLatency: number;
    p50MessageLatency: number;
    p95MessageLatency: number;
    p99MessageLatency: number;
}

export interface DashboardData {
    currentStats: CurrentStats;
    throughput: ThroughputMetrics;
    latencyHistogram: LatencyHistogramBucket[];
    recentTraces: Trace[];
    recentErrors: Array<{
        timestamp: number;
        message: string;
        name: string;
        traceId?: string;
    }>;
    botNames: string[];
    topHeaviestCommands: HeaviestCommand[];
}

export interface TraceSearchQuery {
    traceId?: string;
    botName?: string;
    operationType?: string;
    minDuration?: number;
    maxDuration?: number;
    status?: string;
    fromTime?: number;
    toTime?: number;
    limit?: number;
}

export interface HeaviestCommand {
    actionName: string;
    avgLatency: number;
    maxLatency: number;
    count: number;
    traceIds: string[];
}
