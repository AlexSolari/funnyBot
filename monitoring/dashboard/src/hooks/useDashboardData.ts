import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '../types';
import { fetchDashboardData } from '../api';

export function useDashboardData(autoRefresh: boolean) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const result = await fetchDashboardData();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!autoRefresh) {
            refresh();
            return;
        }

        const base = import.meta.env.BASE_URL.replace(/\/$/, '');
        const es = new EventSource(`${base}/api/events`);

        es.onmessage = (event: MessageEvent<string>) => {
            try {
                const result: DashboardData = JSON.parse(event.data);
                setData(result);
                setError(null);
                setLoading(false);
            } catch {
                setError(new Error('Failed to parse dashboard data'));
            }
        };

        es.onerror = () => {
            setError(new Error('Connection error'));
        };

        return () => es.close();
    }, [autoRefresh, refresh]);

    return { data, error, loading, refresh };
}
