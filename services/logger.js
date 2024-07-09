class Logger{
    logWithTraceId(traceId, text){
        console.log(`TRACE${traceId} ${text}`);
    }
    
    errorWithTraceId(traceId, error){
        console.error(`TRACE${traceId} Error: ${error} \n ${error.stack}`);
    }
}



export default new Logger();