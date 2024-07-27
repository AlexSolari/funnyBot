class Logger {
    logWithTraceId(traceId, text){
        console.log(`TRACE${traceId} ${text}`);
    }
    
    errorWithTraceId(traceId, errorObj){
        console.error(`TRACE${traceId} Error: ${errorObj} \n ${errorObj?.stack}`);
    }
}



export default new Logger();