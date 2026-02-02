import { useEffect, useMemo } from 'react';
import type { Trace } from '../types';
import { formatDateTime, formatTime, getTraceDuration, getTraceStatus } from '../utils/formatters';
import { WaterfallDiagram } from './WaterfallDiagram';

interface TraceDetailModalProps {
    readonly trace: Trace | null;
    readonly onClose: () => void;
}

export function TraceDetailModal({ trace, onClose }: TraceDetailModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Calculate actual duration from span end times (using shared utility)
    const actualDuration = useMemo(() => {
        if (!trace) return undefined;
        return getTraceDuration(trace);
    }, [trace]);

    if (!trace) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
            onClose();
        }
    };

    const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            onClose();
        }
    };

    return (
        <div className="modal active">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
                className="modal-backdrop"
                onClick={handleBackdropClick}
                onKeyDown={handleBackdropKeyDown}
            />
            <div className="modal-content" aria-labelledby="modal-title">
                <div className="modal-header">
                    <h2 id="modal-title">Trace Details</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    <div className="trace-detail-header">
                        <div className="trace-detail-item">
                            <div className="label">Trace ID</div>
                            <div className="value">{trace.traceId}</div>
                        </div>
                        <div className="trace-detail-item">
                            <div className="label">Bot</div>
                            <div className="value">{trace.botName}</div>
                        </div>
                        <div className="trace-detail-item">
                            <div className="label">Operation Type</div>
                            <div className="value">{trace.operationType}</div>
                        </div>
                        <div className="trace-detail-item">
                            <div className="label">Duration</div>
                            <div className="value">
                                {actualDuration === undefined
                                    ? 'In progress'
                                    : `${actualDuration}ms`}
                            </div>
                        </div>
                        <div className="trace-detail-item">
                            <div className="label">Status</div>
                            <div className="value">
                                <span
                                    className={`status-badge-table status-${getTraceStatus(trace)}`}
                                >
                                    {getTraceStatus(trace)}
                                </span>
                            </div>
                        </div>
                        <div className="trace-detail-item">
                            <div className="label">Start Time</div>
                            <div className="value">
                                {formatDateTime(trace.startTime)}
                            </div>
                        </div>
                    </div>

                    <div className="trace-waterfall-section">
                        <h3>Waterfall Timeline</h3>
                        <WaterfallDiagram
                            spans={trace.spans}
                            traceStartTime={trace.startTime}
                            totalDuration={actualDuration}
                        />
                    </div>

                    <div className="spans-timeline">
                        <h3>Span Details ({trace.spans.length})</h3>
                        {trace.spans.map((span) => (
                            <div
                                key={span.spanId}
                                className={`span-item ${span.status === 'error' ? 'error' : ''}`}
                            >
                                <div className="span-header">
                                    <span className="span-name">
                                        {span.operationName}
                                    </span>
                                    <span className="span-duration">
                                        {span.duration === undefined
                                            ? 'pending'
                                            : `${span.duration}ms`}
                                    </span>
                                </div>
                                <div className="span-tags">
                                    {Object.entries(span.tags).map(
                                        ([key, value]) => (
                                            <span
                                                key={key}
                                                className="span-tag"
                                            >
                                                {key}: {String(value)}
                                            </span>
                                        )
                                    )}
                                </div>
                                {span.logs.length > 0 && (
                                    <div className="span-logs">
                                        {span.logs.map((log) => (
                                            <div key={`${log.timestamp}-${log.message.slice(0, 20)}`} className="span-log">
                                                [{formatTime(log.timestamp)}]{' '}
                                                {log.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
