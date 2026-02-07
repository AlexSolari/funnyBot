import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    type ChartData,
    type ChartOptions
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type {
    ThroughputMetrics,
    LatencyHistogramBucket,
    CurrentStats
} from '../types';
import { formatTime } from '../utils/formatters';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const chartDefaults: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#8b949e' }
        }
    },
    scales: {
        x: {
            ticks: { color: '#8b949e' },
            grid: { color: '#30363d' }
        },
        y: {
            ticks: { color: '#8b949e' },
            grid: { color: '#30363d' },
            beginAtZero: true
        }
    }
};

const logLatencyChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: '#8b949e' }
        }
    },
    scales: {
        x: {
            ticks: { color: '#8b949e' },
            grid: { color: '#30363d' }
        },
        y: {
            type: 'logarithmic',
            ticks: {
                color: '#8b949e',
                autoSkip: false,
                callback: (value) => {
                    const v = Number(value);
                    const log = Math.log10(v);
                    if (!Number.isInteger(log)) return '';
                    if (v >= 1000) return `${v / 1000}s`;
                    return `${v}ms`;
                }
            },
            grid: { color: '#30363d' },
            min: 1
        }
    }
};

const logBarChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        x: {
            ticks: { color: '#8b949e' },
            grid: { color: '#30363d' }
        },
        y: {
            type: 'logarithmic',
            ticks: {
                color: '#8b949e',
                autoSkip: false,
                callback: (value) => {
                    const v = Number(value);
                    const log = Math.log10(v);
                    if (!Number.isInteger(log)) return '';
                    return v.toLocaleString();
                }
            },
            grid: { color: '#30363d' },
            min: 1
        }
    }
};

interface ChartsGridProps {
    readonly throughput: ThroughputMetrics;
    readonly latencyHistogram: LatencyHistogramBucket[];
    readonly stats: CurrentStats;
}

export function ChartsGrid({
    throughput,
    latencyHistogram,
    stats
}: ChartsGridProps) {
    const labels = throughput.messagesReceived.map((p) => formatTime(p.timestamp));

    const throughputData: ChartData<'line'> = {
        labels,
        datasets: [
            {
                label: 'Messages',
                data: throughput.messagesReceived.map((p) => p.value),
                borderColor: '#58a6ff',
                fill: false,
                tension: 0.3
            },
            {
                label: 'Commands',
                data: throughput.commandsExecuted.map((p) => p.value),
                borderColor: '#3fb950',
                fill: false,
                tension: 0.3
            },
            {
                label: 'Inline',
                data: throughput.inlineQueriesProcessed.map((p) => p.value),
                borderColor: '#a371f7',
                fill: false,
                tension: 0.3
            }
        ]
    };

    const errorData: ChartData<'line'> = {
        labels,
        datasets: [
            {
                label: 'Errors',
                data: throughput.errors.map((p) => p.value),
                borderColor: '#f85149',
                backgroundColor: 'rgba(248,81,73,0.1)',
                fill: true,
                tension: 0.3
            }
        ]
    };

    const latencyData: ChartData<'line'> = {
        labels,
        datasets: [
            {
                label: 'Avg Latency (ms)',
                data: throughput.avgLatency?.map((p) => p.value) || [],
                borderColor: '#d29922',
                backgroundColor: 'rgba(210,153,34,0.1)',
                fill: true,
                tension: 0.3
            }
        ]
    };

    const histogramData: ChartData<'bar'> = {
        labels: [
            '<10ms',
            '<25ms',
            '<50ms',
            '<100ms',
            '<250ms',
            '<500ms',
            '<1s',
            '<2.5s',
            '<5s',
            '<10s',
            '>10s'
        ],
        datasets: [
            {
                label: 'Requests',
                data: latencyHistogram.map((h, i) => {
                    const prev = i > 0 ? latencyHistogram[i - 1].count : 0;
                    return h.count - prev;
                }),
                backgroundColor: '#58a6ff'
            }
        ]
    };

    const operationsData: ChartData<'doughnut'> = {
        labels: ['Messages', 'Commands', 'Inline', 'Scheduled', 'API'],
        datasets: [
            {
                data: [
                    stats.totalMessagesReceived,
                    stats.totalCommandsExecuted,
                    stats.totalInlineQueries,
                    stats.totalScheduledTasks,
                    stats.totalApiRequests
                ],
                backgroundColor: [
                    '#58a6ff',
                    '#3fb950',
                    '#a371f7',
                    '#f0883e',
                    '#d29922'
                ]
            }
        ]
    };

    return (
        <div className="charts-grid">
            <div className="chart-card">
                <h3>Throughput (per minute)</h3>
                <div className="chart-container">
                    <Line data={throughputData} options={chartDefaults} />
                </div>
            </div>
            <div className="chart-card">
                <h3>Error Rate</h3>
                <div className="chart-container">
                    <Line data={errorData} options={chartDefaults} />
                </div>
            </div>
            <div className="chart-card">
                <h3>Average Latency (rolling 1 min)</h3>
                <div className="chart-container">
                    <Line data={latencyData} options={logLatencyChartOptions} />
                </div>
            </div>
            <div className="chart-card">
                <h3>Latency Distribution (messages)</h3>
                <div className="chart-container">
                    <Bar
                        data={histogramData}
                        options={logBarChartOptions}
                    />
                </div>
                <div className="latency-grid">
                    <div className="latency-item">
                        <div className="percentile">P50</div>
                        <div className="ms">
                            {Math.round(stats.p50MessageLatency)}ms
                        </div>
                    </div>
                    <div className="latency-item">
                        <div className="percentile">P95</div>
                        <div className="ms">
                            {Math.round(stats.p95MessageLatency)}ms
                        </div>
                    </div>
                    <div className="latency-item">
                        <div className="percentile">P99</div>
                        <div className="ms">
                            {Math.round(stats.p99MessageLatency)}ms
                        </div>
                    </div>
                </div>
            </div>
            <div className="chart-card">
                <h3>Operations Breakdown</h3>
                <div className="chart-container">
                    <Doughnut
                        data={operationsData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: { color: '#8b949e' }
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
