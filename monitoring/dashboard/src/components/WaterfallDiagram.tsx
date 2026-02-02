import type { TraceSpan } from '../types';

interface WaterfallDiagramProps {
    readonly spans: TraceSpan[];
    readonly traceStartTime: number;
    readonly totalDuration?: number;
}

// Event phase configuration for visual grouping
const PHASE_CONFIG: Record<string, { color: string; order: number }> = {
    'reception': { color: '#58a6ff', order: 1 },
    'processing': { color: '#a371f7', order: 2 },
    'command': { color: '#3fb950', order: 3 },
    'response': { color: '#f0883e', order: 4 },
    'finalization': { color: '#d29922', order: 5 }
};

function getPhaseColor(phase: string | undefined): string {
    if (phase && PHASE_CONFIG[phase]) {
        return PHASE_CONFIG[phase].color;
    }
    return '#8b949e';
}

function getStatusIndicator(status: string): string {
    switch (status) {
        case 'success':
            return '✓';
        case 'error':
            return '✗';
        case 'pending':
            return '⋯';
        default:
            return '';
    }
}

export function WaterfallDiagram({
    spans,
    traceStartTime,
    totalDuration
}: WaterfallDiagramProps) {
    if (spans.length === 0) {
        return <div className="waterfall-empty">No events to display</div>;
    }

    // Sort spans by start time for chronological display
    const sortedSpans = [...spans].sort((a, b) => a.startTime - b.startTime);

    // Calculate the actual duration to use for scaling - use the max of all span end times
    // For each span: if it has duration, use startTime + duration; else use endTime or startTime
    const maxEndTime = Math.max(
        ...spans.map((s) => {
            if (s.duration && s.duration > 0) {
                return s.startTime + s.duration;
            }
            return (s.endTime && s.endTime > 0) ? s.endTime : s.startTime;
        })
    );
    // Always use the actual max extent so everything fits
    const actualDuration = maxEndTime - traceStartTime;
    const effectiveDuration = Math.max(totalDuration ?? actualDuration, actualDuration, 1);

    // Create time markers
    const markerCount = 5;
    const markers = Array.from({ length: markerCount + 1 }, (_, i) => ({
        position: (i / markerCount) * 100,
        time: Math.round((i / markerCount) * effectiveDuration)
    }));

    return (
        <div className="waterfall-container">
            <div className="waterfall-header">
                <div className="waterfall-label-header">
                    <span className="waterfall-index-header">#</span>
                    <span>Event</span>
                </div>
                <div className="waterfall-timeline-header">
                    {markers.map((marker) => (
                        <div
                            key={marker.time}
                            className="waterfall-marker"
                            style={{ left: `${marker.position}%` }}
                        >
                            {marker.time}ms
                        </div>
                    ))}
                </div>
            </div>
            <div className="waterfall-body">
                {sortedSpans.map((span, index) => {
                    const spanStart = span.startTime - traceStartTime;
                    const spanDuration = span.duration ?? 0;
                    const leftPercent = Math.min((spanStart / effectiveDuration) * 100, 100);
                    const widthPercent = Math.min(
                        Math.max((spanDuration / effectiveDuration) * 100, 0.5),
                        100 - leftPercent
                    );
                    const phase = span.tags.phase as string | undefined;
                    const barColor = getPhaseColor(phase);

                    return (
                        <div key={span.spanId} className="waterfall-row">
                            <div className="waterfall-label">
                                <span className="waterfall-index">{index + 1}</span>
                                <span className="waterfall-operation-name">
                                    {span.operationName}
                                </span>
                                <span className={`waterfall-status status-${span.status}`}>
                                    {getStatusIndicator(span.status)}
                                </span>
                            </div>
                            <div className="waterfall-timeline">
                                <div className="waterfall-track">
                                    {markers.map((marker) => (
                                        <div
                                            key={marker.time}
                                            className="waterfall-gridline"
                                            style={{ left: `${marker.position}%` }}
                                        />
                                    ))}
                                    <div
                                        className="waterfall-bar"
                                        style={{
                                            left: `${leftPercent}%`,
                                            width: `${widthPercent}%`,
                                            backgroundColor: barColor
                                        }}
                                        title={`${span.operationName}: +${Math.round(spanStart)}ms${spanDuration > 0 ? ` (${spanDuration}ms)` : ''}`}
                                    >
                                        {widthPercent > 8 && spanDuration > 0 && (
                                            <span className="waterfall-bar-label">
                                                {spanDuration}ms
                                            </span>
                                        )}
                                    </div>
                                    {/* Show event marker for instant events */}
                                    {spanDuration === 0 && (
                                        <div
                                            className="waterfall-event-marker"
                                            style={{
                                                left: `${leftPercent}%`,
                                                backgroundColor: barColor
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="waterfall-legend">
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#58a6ff' }} />
                    Reception
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#a371f7' }} />
                    Processing
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#3fb950' }} />
                    Command
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#f0883e' }} />
                    Response
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#d29922' }} />
                    Finalization
                </div>
            </div>
        </div>
    );
}
