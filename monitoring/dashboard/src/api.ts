import type { DashboardData, Trace, TraceSearchQuery } from './types';

const API_BASE = '/api';

export async function fetchDashboardData(): Promise<DashboardData> {
    const response = await fetch(`${API_BASE}/dashboard`);
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
    }
    return response.json();
}

export async function searchTraces(query: TraceSearchQuery): Promise<Trace[]> {
    const params = new URLSearchParams();

    if (query.traceId) params.set('traceId', query.traceId);
    if (query.botName) params.set('botName', query.botName);
    if (query.operationType) params.set('operationType', query.operationType);
    if (query.status) params.set('status', query.status);
    if (query.minDuration !== undefined)
        params.set('minDuration', String(query.minDuration));
    if (query.maxDuration !== undefined)
        params.set('maxDuration', String(query.maxDuration));
    if (query.limit !== undefined) params.set('limit', String(query.limit));

    const response = await fetch(`${API_BASE}/traces?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to search traces');
    }
    return response.json();
}

export async function fetchTraceById(traceId: string): Promise<Trace | null> {
    const response = await fetch(`${API_BASE}/trace/${traceId}`);
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch trace');
    }
    return response.json();
}
