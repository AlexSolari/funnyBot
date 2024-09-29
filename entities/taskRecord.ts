import { Milliseconds } from "../types/timeValues";

export default class TaskRecord{
    name: string;
    taskId: NodeJS.Timeout;
    interval: Milliseconds;

    constructor(name: string, taskId: NodeJS.Timeout, interval: Milliseconds){
        this.name = name;
        this.taskId = taskId;
        this.interval = interval;
    }
}
