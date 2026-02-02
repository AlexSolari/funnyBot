import { formatUptime } from '../utils/formatters';

interface HeaderProps {
    uptime: number;
    autoRefresh: boolean;
    onAutoRefreshChange: (value: boolean) => void;
    onRefresh: () => void;
}

export function Header({
    uptime,
    autoRefresh,
    onAutoRefreshChange,
    onRefresh
}: Readonly<HeaderProps>) {
    return (
        <header className="header">
            <h1>Bot Monitoring Dashboard</h1>
            <div className="refresh-controls">
                <label className="auto-refresh">
                    <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => onAutoRefreshChange(e.target.checked)}
                    />
                    Auto-refresh (5s)
                </label>
                <button className="btn btn-secondary" onClick={onRefresh}>
                    Refresh Now
                </button>
                <div className="status-badge">
                    <span className="status-dot"></span>
                    <span>{formatUptime(uptime)}</span>
                </div>
            </div>
        </header>
    );
}
