import { useState, useCallback } from 'react';
import {
    Header,
    StatsGrid,
    ChartsGrid,
    TracesTable,
    TraceSearchForm,
    TraceDetailModal,
    ErrorsList,
    HeaviestCommandsWidget
} from './components';
import { useDashboardData } from './hooks/useDashboardData';
import { searchTraces, fetchTraceById } from './api';
import type { Trace, TraceSearchQuery } from './types';
import { DASHBOARD_SETTINGS } from './utils/constants';

type TabType = 'overview' | 'traces' | 'errors';

export default function App() {
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [searchResults, setSearchResults] = useState<Trace[] | null>(null);
    const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingTrace, setIsLoadingTrace] = useState(false);

    const { data, loading, error, refresh } = useDashboardData(
        autoRefresh,
        DASHBOARD_SETTINGS.refreshIntervalMs
    );

    const handleSearch = useCallback(async (query: TraceSearchQuery) => {
        setIsSearching(true);
        try {
            const results = await searchTraces(query);
            setSearchResults(results);
        } catch (err) {
            console.error('Failed to search traces:', err);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchResults(null);
    }, []);

    const handleTraceClick = useCallback(async (traceId: string) => {
        setIsLoadingTrace(true);
        try {
            const trace = await fetchTraceById(traceId);
            if (trace) {
                setSelectedTrace(trace);
            } else {
                alert('Trace not found');
            }
        } catch (err) {
            console.error('Failed to fetch trace:', err);
        } finally {
            setIsLoadingTrace(false);
        }
    }, []);

    const closeModal = useCallback(() => {
        setSelectedTrace(null);
    }, []);

    if (error) {
        return (
            <div className="loading error-state">
                <div className="error-message">
                    Failed to load dashboard data
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={refresh}
                        style={{ marginTop: '1rem' }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !data) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                Loading dashboard...
            </div>
        );
    }

    const tracesToDisplay = searchResults ?? data.recentTraces;

    return (
        <>
            <Header
                uptime={data.currentStats.uptime}
                autoRefresh={autoRefresh}
                onAutoRefreshChange={setAutoRefresh}
                onRefresh={refresh}
            />

            <div className="container">
                <div className="tabs" role="tablist" aria-label="Dashboard sections">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'overview'}
                        aria-controls="panel-overview"
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'traces'}
                        aria-controls="panel-traces"
                        className={`tab ${activeTab === 'traces' ? 'active' : ''}`}
                        onClick={() => setActiveTab('traces')}
                    >
                        Traces
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'errors'}
                        aria-controls="panel-errors"
                        className={`tab ${activeTab === 'errors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('errors')}
                    >
                        Errors
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
                        <StatsGrid
                            stats={data.currentStats}
                            throughput={data.throughput}
                        />
                        <ChartsGrid
                            throughput={data.throughput}
                            latencyHistogram={data.latencyHistogram}
                            stats={data.currentStats}
                        />
                        <HeaviestCommandsWidget
                            commands={data.topHeaviestCommands}
                            onTraceClick={handleTraceClick}
                        />
                    </div>
                )}

                {activeTab === 'traces' && (
                    <div id="panel-traces" role="tabpanel" aria-labelledby="tab-traces">
                        <TraceSearchForm
                            botNames={data.botNames}
                            onSearch={handleSearch}
                            isSearching={isSearching}
                        />
                        {searchResults && (
                            <div className="search-results-header">
                                <span>Showing {searchResults.length} search results</span>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClearSearch}
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                        {isLoadingTrace && (
                            <div className="loading-overlay">
                                <div className="spinner"></div>
                            </div>
                        )}
                        <TracesTable
                            traces={tracesToDisplay}
                            onTraceClick={handleTraceClick}
                        />
                    </div>
                )}

                {activeTab === 'errors' && (
                    <div id="panel-errors" role="tabpanel" aria-labelledby="tab-errors">
                        <ErrorsList
                            errors={data.recentErrors}
                            onTraceClick={handleTraceClick}
                        />
                    </div>
                )}
            </div>

            <TraceDetailModal trace={selectedTrace} onClose={closeModal} />
        </>
    );
}
