class Logger {
    logWithTraceId(traceId: string | number, text: string){
        console.log(`TRACE${traceId} ${text}`);
    }
    
    errorWithTraceId(traceId: string | number, errorObj: string | Error){
        console.error(`TRACE${traceId} Error: ${errorObj} \n ${(errorObj instanceof Error) ? errorObj?.stack : ''}`);
    }
}

export default new Logger();