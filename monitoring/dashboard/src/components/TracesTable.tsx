import { memo, useMemo, useState } from 'react';
import type { Trace } from '../types';
import {
    formatDateTime,
    getLatencyClass,
    getTraceDuration,
    getTraceStatus
} from '../utils/formatters';
import { UI_CONSTANTS } from '../utils/constants';

interface TracesTableProps {
    readonly traces: Trace[];
    readonly onTraceClick: (traceId: string) => void;
}

type SortColumn = 'preview' | 'botName' | 'operationType' | 'duration' | 'status' | 'time';
type SortDirection = 'asc' | 'desc';

// Numeric columns are most useful sorted highest-first by default
const DEFAULT_DIRECTION: Record<SortColumn, SortDirection> = {
    preview: 'asc',
    botName: 'asc',
    operationType: 'asc',
    duration: 'desc',
    status: 'asc',
    time: 'desc'
};

function getTracePreview(trace: Trace): string {
    // Show message preview if available, otherwise show operation name
    if (trace.messagePreview) {
        const maxLength = UI_CONSTANTS.messagePreviewMaxLength;
        return trace.messagePreview.length > maxLength
            ? trace.messagePreview.substring(0, maxLength) + '...'
            : trace.messagePreview;
    }
    return trace.rootSpan.operationName;
}

function getSortValue(trace: Trace, column: SortColumn): string | number {
    switch (column) {
        case 'preview':
            return getTracePreview(trace).toLowerCase();
        case 'botName':
            return trace.botName.toLowerCase();
        case 'operationType':
            return trace.operationType;
        case 'duration':
            return getTraceDuration(trace);
        case 'status':
            return getTraceStatus(trace);
        case 'time':
            return trace.startTime;
    }
}

interface SortableHeaderProps {
    readonly column: SortColumn;
    readonly label: string;
    readonly sortColumn: SortColumn | null;
    readonly sortDirection: SortDirection;
    readonly onSort: (column: SortColumn) => void;
}

function SortableHeader({
    column,
    label,
    sortColumn,
    sortDirection,
    onSort
}: SortableHeaderProps) {
    const isActive = sortColumn === column;
    let indicator = '';
    if (isActive) {
        indicator = sortDirection === 'asc' ? '▲' : '▼';
    }
    return (
        <th>
            <button
                type="button"
                className="sortable-header"
                onClick={() => onSort(column)}
                aria-label={`Sort by ${label}`}
            >
                {label}
                <span className="sort-indicator">{indicator}</span>
            </button>
        </th>
    );
}

function TracesTableComponent({ traces, onTraceClick }: TracesTableProps) {
    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection(DEFAULT_DIRECTION[column]);
        }
    };

    const sortedTraces = useMemo(() => {
        if (!sortColumn) return traces;
        const factor = sortDirection === 'asc' ? 1 : -1;
        return [...traces].sort((a, b) => {
            const va = getSortValue(a, sortColumn);
            const vb = getSortValue(b, sortColumn);
            if (va < vb) return -1 * factor;
            if (va > vb) return 1 * factor;
            return 0;
        });
    }, [traces, sortColumn, sortDirection]);

    const headerProps = { sortColumn, sortDirection, onSort: handleSort };

    if (traces.length === 0) {
        return (
            <div className="chart-card">
                <table className="traces-table">
                    <thead>
                        <tr>
                            <SortableHeader column="preview" label="Message / Operation" {...headerProps} />
                            <SortableHeader column="botName" label="Bot" {...headerProps} />
                            <SortableHeader column="operationType" label="Type" {...headerProps} />
                            <SortableHeader column="duration" label="Duration" {...headerProps} />
                            <SortableHeader column="status" label="Status" {...headerProps} />
                            <SortableHeader column="time" label="Time" {...headerProps} />
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
                        <SortableHeader column="preview" label="Message / Operation" {...headerProps} />
                        <SortableHeader column="botName" label="Bot" {...headerProps} />
                        <SortableHeader column="operationType" label="Type" {...headerProps} />
                        <SortableHeader column="duration" label="Duration" {...headerProps} />
                        <SortableHeader column="status" label="Status" {...headerProps} />
                        <SortableHeader column="time" label="Time" {...headerProps} />
                    </tr>
                </thead>
                <tbody>
                    {sortedTraces.map((trace) => {
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
                                <td className={getLatencyClass(duration)}>
                                    <span className="latency-value">{`${duration}ms`}</span>
                                </td>
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
