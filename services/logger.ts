class Logger {
    logWithTraceId(
        botName: string,
        traceId: string | number,
        chatName: string,
        text: string
    ) {
        console.log(JSON.stringify({ botName, traceId, chatName, text }));
    }

    errorWithTraceId<TData>(
        botName: string,
        traceId: string | number,
        chatName: string,
        errorObj: string | Error,
        extraData?: TData | undefined
    ) {
        console.error(
            JSON.stringify({
                botName,
                traceId,
                chatName,
                errorObj,
                extraData
            })
        );
    }
}

export default new Logger();
