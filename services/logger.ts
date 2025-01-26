class Logger {
    logWithTraceId(botName: string, traceId: string | number, text: string) {
        console.log(`TRACE${traceId} ${botName}|${text}`);
    }

    errorWithTraceId<TData>(
        botName: string,
        traceId: string | number,
        errorObj: string | Error,
        extraData?: TData | undefined
    ) {
        console.error(
            `TRACE${traceId} ${botName}|Error: ${errorObj} \n ${
                errorObj instanceof Error ? errorObj?.stack : ''
            } \n ${extraData ? JSON.stringify(extraData) : ''}`
        );
    }
}

export default new Logger();
