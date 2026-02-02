import { formatDateTime } from '../utils/formatters';

interface ErrorItem {
    timestamp: number;
    message: string;
    name: string;
    traceId?: string;
}

interface ErrorsListProps {
    readonly errors: ErrorItem[];
    readonly onTraceClick: (traceId: string) => void;
}

export function ErrorsList({ errors, onTraceClick }: ErrorsListProps) {
    return (
        <div className="errors-section">
            <h3>🚨 Recent Errors</h3>
            {errors.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        color: '#8b949e',
                        padding: '20px'
                    }}
                >
                    No errors recorded
                </div>
            ) : (
                errors.map((err) => (
                    <div key={`${err.timestamp}-${err.name}`} className="error-item">
                        <div className="error-header">
                            <span className="error-name">{err.name}</span>
                            <span className="error-time">
                                {formatDateTime(err.timestamp)}
                            </span>
                        </div>
                        <div className="error-message">{err.message}</div>
                        {err.traceId && (
                            <div style={{ marginTop: '8px' }}>
                                <button
                                    type="button"
                                    className="trace-id-button"
                                    onClick={() => onTraceClick(err.traceId!)}
                                >
                                    Trace: {err.traceId.substring(0, 8)}...
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
