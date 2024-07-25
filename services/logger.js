import taskScheduler from "./taskScheduler";

class Logger {
    constructor(){
        /** @type {Array<() => void>} */
        this.queue = [];
        this.noop = () => {};

        taskScheduler.createTask("Log", () => (this.queue.pop() ?? this.noop)(), 100);
    }

    logWithTraceId(traceId, text){
        this.queue.push(() => console.log(`TRACE${traceId} ${text}`));
    }
    
    errorWithTraceId(traceId, errorObj){
        this.queue.push(() => console.error(`TRACE${traceId} Error: ${errorObj} \n ${errorObj?.stack}`));
    }
}



export default new Logger();