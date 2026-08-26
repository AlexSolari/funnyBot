import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { metricsCollector } from './metricsCollector';
import { TraceSearchQuery } from './types';

const DASHBOARD_PORT = 3030;
const SSE_PUSH_INTERVAL_MS = 2000;
const SSE_HEARTBEAT_INTERVAL_MS = 30000;

type SseSend = (data: string) => void;
type SseHeartbeat = () => void;
const sseClients = new Set<SseSend>();
const sseHeartbeats = new Set<SseHeartbeat>();
const encoder = new TextEncoder();
let lastBroadcastedData = '';

function broadcastDashboardData(): void {
    if (sseClients.size === 0) return;
    const data = JSON.stringify(metricsCollector.getDashboardData());
    if (data === lastBroadcastedData) return;
    lastBroadcastedData = data;
    for (const send of sseClients) {
        send(data);
    }
}

function broadcastHeartbeat(): void {
    for (const heartbeat of sseHeartbeats) {
        heartbeat();
    }
}

function handleSSE(): Response {
    let send: SseSend | null = null;
    let heartbeat: SseHeartbeat | null = null;
    const stream = new ReadableStream({
        start(controller) {
            send = (data: string) => {
                try {
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                } catch {
                    if (send) sseClients.delete(send);
                    if (heartbeat) sseHeartbeats.delete(heartbeat);
                }
            };
            heartbeat = () => {
                try {
                    controller.enqueue(encoder.encode(': ping\n\n'));
                } catch {
                    if (send) sseClients.delete(send);
                    if (heartbeat) sseHeartbeats.delete(heartbeat);
                }
            };
            sseClients.add(send);
            sseHeartbeats.add(heartbeat);
            send(JSON.stringify(metricsCollector.getDashboardData()));
        },
        cancel() {
            if (send) {
                sseClients.delete(send);
                send = null;
            }
            if (heartbeat) {
                sseHeartbeats.delete(heartbeat);
                heartbeat = null;
            }
        }
    });
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            ...CORS_HEADERS
        }
    });
}

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

// Vite content-hashes these filenames, so they're safe to cache forever
const IMMUTABLE_CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=31536000, immutable'
};

function parseQueryString(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of new URL(url).searchParams) {
        params[key] = value;
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
    // The SPA entry point must always be revalidated; hashed assets can be cached forever
    const cacheHeaders =
        filePath === 'index.html' ? NO_CACHE_HEADERS : IMMUTABLE_CACHE_HEADERS;

    try {
        const content = await readFile(fullPath);
        return new Response(content, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                ...cacheHeaders
            }
        });
    } catch {
        return errorResponse('Not found', 404);
    }
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

async function handleAssets(
    req: Request,
    routePrefix: string
): Promise<Response> {
    const url = new URL(req.url);
    const normalizedPath = routePrefix
        ? url.pathname.replace(new RegExp(`^${routePrefix}/`), '/')
        : url.pathname;
    const assetPath = normalizedPath.substring(1); // Remove leading /
    return serveStaticFile(assetPath);
}

// Single source of truth for routes; prefixed with '' in production or '/bots' behind the dev proxy
function buildRoutes(prefix: string) {
    return {
        [prefix || '/']: () => serveStaticFile('index.html'),
        [`${prefix}/index.html`]: () => serveStaticFile('index.html'),
        [`${prefix}/api/events`]: {
            OPTIONS: handleCorsOptions,
            GET: handleSSE
        },
        [`${prefix}/api/dashboard`]: {
            OPTIONS: handleCorsOptions,
            GET: handleDashboard
        },
        [`${prefix}/api/stats`]: {
            OPTIONS: handleCorsOptions,
            GET: handleStats
        },
        [`${prefix}/api/throughput`]: {
            OPTIONS: handleCorsOptions,
            GET: handleThroughput
        },
        [`${prefix}/api/latency`]: {
            OPTIONS: handleCorsOptions,
            GET: handleLatency
        },
        [`${prefix}/api/traces`]: {
            OPTIONS: handleCorsOptions,
            GET: handleTraces
        },
        [`${prefix}/api/trace/:id`]: {
            OPTIONS: handleCorsOptions,
            GET: handleTraceById
        },
        [`${prefix}/assets/*`]: (req: Request) => handleAssets(req, prefix)
    };
}

export function startDashboardServer(
    port: number = DASHBOARD_PORT
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const isProduction = process.env.NODE_ENV === 'production';
            const routePrefix = isProduction ? '' : '/bots';

            Bun.serve({
                port,
                routes: buildRoutes(routePrefix) as any,
                // Fallback for SPA routing and unmatched routes
                fetch(req) {
                    const url = new URL(req.url);

                    // Handle CORS preflight for any route
                    if (req.method === 'OPTIONS') {
                        return handleCorsOptions();
                    }

                    const assetPrefix = `${routePrefix}/assets/`;
                    if (url.pathname.startsWith(assetPrefix)) {
                        return handleAssets(req, routePrefix);
                    }

                    const apiPrefix = `${routePrefix}/api/`;
                    const isApiRoute = url.pathname.startsWith(apiPrefix);

                    // For SPA routing, serve index.html for non-API routes
                    if (!isApiRoute) {
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
            setInterval(broadcastDashboardData, SSE_PUSH_INTERVAL_MS);
            setInterval(broadcastHeartbeat, SSE_HEARTBEAT_INTERVAL_MS);
            resolve();
        } catch (err) {
            console.error('Failed to start dashboard server:', err);
            reject(err);
        }
    });
}

export { DASHBOARD_PORT };
