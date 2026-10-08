import { memo } from 'react';
import { formatNumber, formatUptime } from '../utils/formatters';
import { DASHBOARD_SETTINGS } from '../utils/constants';
import type { CaptureStats, CurrentStats, ThroughputMetrics } from '../types';

interface StatsGridProps {
    readonly stats: CurrentStats;
    readonly throughput: ThroughputMetrics;
    readonly captureStats: CaptureStats;
}

function StatsGridComponent({ stats, throughput, captureStats }: StatsGridProps) {
    const recentMessages = throughput.messagesReceived.slice(
        -DASHBOARD_SETTINGS.recentMessagesCount
    );
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
            <div className={`stat-card${stats.totalErrors > 0 ? ' error' : ''}`}>
                <div className="label">Errors</div>
                <div className="value">{formatNumber(stats.totalErrors)}</div>
            </div>
            <div className="stat-card">
                <div className="label">Active Traces</div>
                <div className="value">{formatNumber(stats.activeTraces)}</div>
            </div>
            <div className="stat-card">
                <div className="label">Active Captures</div>
                <div className="value">{formatNumber(captureStats.active)}</div>
                <div className="subvalue">
                    {captureStats.completed > 0
                        ? `${Math.round(captureStats.answeredRate * 100)}% answered · avg ${formatUptime(captureStats.avgLifetime)}`
                        : 'none completed yet'}
                    {captureStats.restored > 0 &&
                        ` · ${formatNumber(captureStats.restored)} restored`}
                </div>
            </div>
        </div>
    );
}

export const StatsGrid = memo(StatsGridComponent);
