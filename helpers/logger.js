export default function logWithTraceId(traceId, text){
    console.log(`TRACE${traceId} ${text}`);
}