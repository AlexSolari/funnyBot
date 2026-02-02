import type { HeaviestCommand } from '../types';

interface HeaviestCommandsWidgetProps {
    commands: HeaviestCommand[];
    onTraceClick: (traceId: string) => void;
}

export function HeaviestCommandsWidget({ commands, onTraceClick }: Readonly<HeaviestCommandsWidgetProps>) {
    if (commands.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3>🐌 Top 10 Heaviest Commands</h3>
                </div>
                <div className="card-content">
                    <p className="empty-state">No command data available yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card heaviest-commands-widget">
            <div className="card-header">
                <h3>🐌 Top 10 Heaviest Commands</h3>
            </div>
            <div className="card-content">
                <table className="heaviest-commands-table">
                    <thead>
                        <tr>
                            <th>Command</th>
                            <th>Avg Latency</th>
                            <th>Max Latency</th>
                            <th>Count</th>
                            <th>Sample Traces</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commands.map((cmd, index) => (
                            <tr key={cmd.actionName} className={getLatencyClass(cmd.avgLatency)}>
                                <td className="command-name">
                                    <span className="rank">#{index + 1}</span>
                                    <code>{cmd.actionName}</code>
                                </td>
                                <td className="latency-cell">
                                    <span className="latency-value">{formatLatency(cmd.avgLatency)}</span>
                                </td>
                                <td className="latency-cell">
                                    <span className="latency-value max">{formatLatency(cmd.maxLatency)}</span>
                                </td>
                                <td className="count-cell">{cmd.count}</td>
                                <td className="traces-cell">
                                    {cmd.traceIds.slice(0, 3).map((traceId, i) => (
                                        <button
                                            key={traceId}
                                            className="trace-link"
                                            onClick={() => onTraceClick(traceId)}
                                            title={traceId}
                                        >
                                            {i > 0 && ', '}
                                            {traceId.slice(0, 8)}
                                        </button>
                                    ))}
                                    {cmd.traceIds.length > 3 && (
                                        <span className="more-traces">+{cmd.traceIds.length - 3}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatLatency(ms: number): string {
    if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
}

function getLatencyClass(ms: number): string {
    if (ms >= 5000) return 'latency-critical';
    if (ms >= 1000) return 'latency-high';
    if (ms >= 500) return 'latency-medium';
    return 'latency-low';
}
