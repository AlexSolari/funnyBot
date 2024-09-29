import TaskRecord from "../entities/taskRecord";
import { secondsToMilliseconds } from "../helpers/timeConvertions";
import { Milliseconds } from "../types/timeValues";

class TaskScheduler {
    activeTasks: TaskRecord[] = [];

    createTask(name: string, action: () => void, interval: Milliseconds, executeRightAway: boolean) {
        executeRightAway = executeRightAway ?? false;
        const taskId = setInterval(action, interval);
        const task = new TaskRecord(
            name,
            taskId,
            interval
        );

        if (executeRightAway) {
            setTimeout(action, secondsToMilliseconds(1));
        }

        console.log(`Created task [${taskId}]${name}, that will run every ${interval}ms.`)

        this.activeTasks.push(task);
    }
    
    createOnetimeTask(name: string, action: () => void, delay: Milliseconds) {
        const actionWrapper = () => {
            console.log(`Executing delayed oneshot [${taskId}]${name}`);
            action();
        };
        const taskId = setTimeout(actionWrapper, delay);

        console.log(`Created oneshot task [${taskId}]${name}, that will run in ${delay}ms.`);
    }
}

export default new TaskScheduler();