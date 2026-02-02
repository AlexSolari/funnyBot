import { useState } from 'react';
import type { TraceSearchQuery } from '../types';
import { SEARCH_DEFAULTS } from '../utils/constants';

interface TraceSearchFormProps {
    readonly botNames: string[];
    readonly onSearch: (query: TraceSearchQuery) => void;
    readonly isSearching?: boolean;
}

export function TraceSearchForm({ botNames, onSearch, isSearching = false }: TraceSearchFormProps) {
    const [traceId, setTraceId] = useState('');
    const [botName, setBotName] = useState('');
    const [operationType, setOperationType] = useState('');
    const [status, setStatus] = useState('');
    const [minDuration, setMinDuration] = useState('');
    const [maxDuration, setMaxDuration] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({
            traceId: traceId || undefined,
            botName: botName || undefined,
            operationType: operationType || undefined,
            status: status || undefined,
            minDuration: minDuration ? Number(minDuration) : undefined,
            maxDuration: maxDuration ? Number(maxDuration) : undefined,
            limit: SEARCH_DEFAULTS.limit
        });
    };

    return (
        <div className="search-section">
            <form className="search-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="searchTraceId">Trace ID</label>
                    <input
                        type="text"
                        id="searchTraceId"
                        placeholder="Search by trace ID..."
                        value={traceId}
                        onChange={(e) => setTraceId(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="searchBot">Bot</label>
                    <select
                        id="searchBot"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                    >
                        <option value="">All Bots</option>
                        {botNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="searchOperationType">Operation Type</label>
                    <select
                        id="searchOperationType"
                        value={operationType}
                        onChange={(e) => setOperationType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="message">Message</option>
                        <option value="command">Command</option>
                        <option value="inline">Inline</option>
                        <option value="scheduled">Scheduled</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="searchStatus">Status</label>
                    <select
                        id="searchStatus"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="success">Success</option>
                        <option value="error">Error</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="searchMinDuration">Min Duration (ms)</label>
                    <input
                        type="number"
                        id="searchMinDuration"
                        placeholder="0"
                        value={minDuration}
                        onChange={(e) => setMinDuration(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="searchMaxDuration">Max Duration (ms)</label>
                    <input
                        type="number"
                        id="searchMaxDuration"
                        placeholder="10000"
                        value={maxDuration}
                        onChange={(e) => setMaxDuration(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSearching}
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>
        </div>
    );
}
