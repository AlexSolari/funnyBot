import { memo } from 'react';
import type { Trace } from '../types';
import { formatDateTime, getTraceDuration, getTraceStatus } from '../utils/formatters';

interface TracesTableProps {
    readonly traces: Trace[];
    readonly onTraceClick: (traceId: string) => void;
}

function getTracePreview(trace: Trace): string {
    // Show message preview if available, otherwise show operation name
    if (trace.messagePreview) {
        return trace.messagePreview.length > 50 
            ? trace.messagePreview.substring(0, 50) + '...' 
            : trace.messagePreview;
    }
    return trace.rootSpan.operationName;
}

function TracesTableComponent({ traces, onTraceClick }: TracesTableProps) {
    if (traces.length === 0) {
        return (
            <div className="chart-card">
                <table className="traces-table">
                    <thead>
                        <tr>
                            <th>Message / Operation</th>
                            <th>Bot</th>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td
                                colSpan={6}
                                style={{
                                    textAlign: 'center',
                                    color: '#8b949e'
                                }}
                            >
                                No traces found
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="chart-card">
            <table className="traces-table">
                <thead>
                    <tr>
                        <th>Message / Operation</th>
                        <th>Bot</th>
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {traces.map((trace) => {
                        const status = getTraceStatus(trace);
                        const duration = getTraceDuration(trace);
                        return (
                            <tr key={trace.traceId}>
                                <td>
                                    <button
                                        type="button"
                                        className="trace-id-button"
                                        onClick={() => onTraceClick(trace.traceId)}
                                    >
                                        {getTracePreview(trace)}
                                    </button>
                                </td>
                                <td>{trace.botName}</td>
                                <td>
                                    <span className="operation-type">
                                        {trace.operationType}
                                    </span>
                                </td>
                                <td>{`${duration}ms`}</td>
                                <td>
                                    <span
                                        className={`status-badge-table status-${status}`}
                                    >
                                        {status}
                                    </span>
                                </td>
                                <td>{formatDateTime(trace.startTime)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export const TracesTable = memo(TracesTableComponent);
