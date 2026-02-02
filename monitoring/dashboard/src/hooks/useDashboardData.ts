import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '../types';
import { fetchDashboardData } from '../api';

export function useDashboardData(autoRefresh: boolean, intervalMs = 5000) {
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
        refresh();
    }, [refresh]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(refresh, intervalMs);
        return () => clearInterval(interval);
    }, [autoRefresh, intervalMs, refresh]);

    return { data, error, loading, refresh };
}
