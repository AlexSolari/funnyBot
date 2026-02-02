import { memo } from 'react';
import { formatNumber } from '../utils/formatters';
import type { CurrentStats, ThroughputMetrics } from '../types';

interface StatsGridProps {
    readonly stats: CurrentStats;
    readonly throughput: ThroughputMetrics;
}

function StatsGridComponent({ stats, throughput }: StatsGridProps) {
    const recentMessages = throughput.messagesReceived.slice(-5);
    const avgRate =
        recentMessages.length > 0
            ? recentMessages.reduce((sum, p) => sum + p.value, 0) /
              recentMessages.length
            : 0;

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="label">Messages Received</div>
                <div className="value">
                    {formatNumber(stats.totalMessagesReceived)}
                </div>
                <div className="subvalue">{avgRate.toFixed(1)}/min</div>
            </div>
            <div className="stat-card">
                <div className="label">Commands Executed</div>
                <div className="value">
                    {formatNumber(stats.totalCommandsExecuted)}
                </div>
            </div>
            <div className="stat-card">
                <div className="label">Inline Queries</div>
                <div className="value">
                    {formatNumber(stats.totalInlineQueries)}
                </div>
            </div>
            <div className="stat-card">
                <div className="label">Scheduled Tasks</div>
                <div className="value">
                    {formatNumber(stats.totalScheduledTasks)}
                </div>
            </div>
            <div className="stat-card">
                <div className="label">API Requests</div>
                <div className="value">
                    {formatNumber(stats.totalApiRequests)}
                </div>
            </div>
            <div className="stat-card error">
                <div className="label">Errors</div>
                <div className="value">{formatNumber(stats.totalErrors)}</div>
            </div>
            <div className="stat-card">
                <div className="label">Active Traces</div>
                <div className="value">{formatNumber(stats.activeTraces)}</div>
            </div>
        </div>
    );
}

export const StatsGrid = memo(StatsGridComponent);
