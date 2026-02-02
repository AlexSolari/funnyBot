// Chart colors
export const CHART_COLORS = {
    messages: '#58a6ff',
    commands: '#3fb950',
    inline: '#a371f7',
    errors: '#f85149',
    latency: '#d29922',
    scheduled: '#f0883e',
    api: '#8b949e'
} as const;

// Chart styling
export const CHART_STYLES = {
    tension: 0.3,
    gridColor: '#30363d',
    labelColor: '#8b949e'
} as const;

// Search defaults
export const SEARCH_DEFAULTS = {
    limit: 100,
    maxDurationPlaceholder: 10000
} as const;

// Dashboard refresh
export const DASHBOARD_SETTINGS = {
    refreshIntervalMs: 5000,
    recentMessagesCount: 5
} as const;

// Latency histogram bucket labels
export const HISTOGRAM_LABELS = [
    '<10ms',
    '<25ms',
    '<50ms',
    '<100ms',
    '<250ms',
    '<500ms',
    '<1s',
    '<2.5s',
    '>2.5s'
] as const;

// Message preview max length
export const UI_CONSTANTS = {
    messagePreviewMaxLength: 50
} as const;
