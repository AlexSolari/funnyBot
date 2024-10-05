class Logger {
    logWithTraceId(botName: string, traceId: string | number, text: string){
        console.log(`TRACE${traceId} ${botName}|${text}`);
    }
    
    errorWithTraceId(botName: string, traceId: string | number, errorObj: string | Error){
        console.error(`TRACE${traceId} ${botName}|Error: ${errorObj} \n ${(errorObj instanceof Error) ? errorObj?.stack : ''}`);
    }
}

export default new Logger();