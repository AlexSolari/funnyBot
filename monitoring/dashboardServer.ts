import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { metricsCollector } from './metricsCollector';
import { TraceSearchQuery } from './types';

const DASHBOARD_PORT = 3030;

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

const NO_CACHE_HEADERS = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0'
};

function parseQueryString(url: string): Record<string, string> {
    const queryString = url.split('?')[1] || '';
    const params: Record<string, string> = {};

    for (const pair of queryString.split('&')) {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    }

    return params;
}

function jsonResponse(data: unknown, statusCode = 200): Response {
    return new Response(JSON.stringify(data), {
        status: statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS
        }
    });
}

function errorResponse(message: string, statusCode = 500): Response {
    return jsonResponse({ error: message }, statusCode);
}

async function serveStaticFile(filePath: string): Promise<Response> {
    const distPath = join(import.meta.dirname, 'dashboard', 'dist');
    const fullPath = join(distPath, filePath);
    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
        const content = await readFile(fullPath);
        return new Response(content, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                ...NO_CACHE_HEADERS
            }
        });
    } catch {
        // Fallback to legacy dashboard.html if React build not found
        if (filePath === 'index.html') {
            try {
                const legacyPath = join(import.meta.dirname, 'dashboard.html');
                const html = await readFile(legacyPath, 'utf-8');
                return new Response(html, {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
            } catch {
                return new Response(getInlineDashboard(), {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
            }
        }
        return errorResponse('Not found', 404);
    }
}

function getInlineDashboard(): string {
    return `<!DOCTYPE html>
<html><head><title>Bot Monitoring</title></head>
<body><h1>Dashboard Loading Error</h1><p>Please ensure dashboard.html exists in the monitoring folder.</p></body>
</html>`;
}

function handleCorsOptions(): Response {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
    });
}

function handleDashboard(): Response {
    return jsonResponse(metricsCollector.getDashboardData());
}

function handleStats(): Response {
    return jsonResponse(metricsCollector.getCurrentStats());
}

function handleThroughput(): Response {
    return jsonResponse(metricsCollector.getThroughputMetrics());
}

function handleLatency(): Response {
    return jsonResponse(metricsCollector.getLatencyMetrics());
}

function handleTraces(req: Request): Response {
    const params = parseQueryString(req.url);
    const query: TraceSearchQuery = {
        traceId: params.traceId || undefined,
        botName: params.botName || undefined,
        operationType: params.operationType || undefined,
        minDuration: params.minDuration
            ? Number.parseInt(params.minDuration, 10)
            : undefined,
        maxDuration: params.maxDuration
            ? Number.parseInt(params.maxDuration, 10)
            : undefined,
        status: params.status || undefined,
        fromTime: params.fromTime
            ? Number.parseInt(params.fromTime, 10)
            : undefined,
        toTime: params.toTime ? Number.parseInt(params.toTime, 10) : undefined,
        limit: params.limit ? Number.parseInt(params.limit, 10) : 100
    };

    return jsonResponse(metricsCollector.searchTraces(query));
}

function handleTraceById(req: Request & { params: { id: string } }): Response {
    const traceId = req.params.id;
    const trace = metricsCollector.getTraceById(traceId);

    if (trace) {
        return jsonResponse(trace);
    }
    return errorResponse('Trace not found', 404);
}

async function handleAssets(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const assetPath = url.pathname.substring(1); // Remove leading /
    return serveStaticFile(assetPath);
}

export function startDashboardServer(
    port: number = DASHBOARD_PORT
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            Bun.serve({
                port,
                routes: {
                    // Dashboard root
                    '/': () => serveStaticFile('index.html'),
                    '/index.html': () => serveStaticFile('index.html'),

                    // API Routes
                    '/api/dashboard': {
                        OPTIONS: handleCorsOptions,
                        GET: handleDashboard
                    },
                    '/api/stats': {
                        OPTIONS: handleCorsOptions,
                        GET: handleStats
                    },
                    '/api/throughput': {
                        OPTIONS: handleCorsOptions,
                        GET: handleThroughput
                    },
                    '/api/latency': {
                        OPTIONS: handleCorsOptions,
                        GET: handleLatency
                    },
                    '/api/traces': {
                        OPTIONS: handleCorsOptions,
                        GET: handleTraces
                    },
                    '/api/trace/:id': {
                        OPTIONS: handleCorsOptions,
                        GET: handleTraceById
                    },

                    // Static assets
                    '/assets/*': handleAssets
                },
                // Fallback for SPA routing and unmatched routes
                fetch(req) {
                    const url = new URL(req.url);

                    // Handle CORS preflight for any route
                    if (req.method === 'OPTIONS') {
                        return handleCorsOptions();
                    }

                    // For SPA routing, serve index.html for non-API routes
                    if (!url.pathname.startsWith('/api/')) {
                        return serveStaticFile('index.html');
                    }

                    // 404 for unmatched API routes
                    return errorResponse('Not found', 404);
                },
                error(error: Error) {
                    console.error('Dashboard server error:', error);
                    return errorResponse('Internal server error', 500);
                }
            });

            console.log(`📊 Monitoring dashboard running at ${port}`);
            resolve();
        } catch (err) {
            console.error('Failed to start dashboard server:', err);
            reject(err);
        }
    });
}

export { DASHBOARD_PORT };
