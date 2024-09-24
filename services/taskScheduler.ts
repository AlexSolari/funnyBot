import { ITaskRecord } from "../entities/taskRecord";

class TaskScheduler {
    activeTasks: ITaskRecord[] = [];

    createTask(name: string, action: () => void, interval: number, executeRightAway: boolean) {
        executeRightAway = executeRightAway ?? false;
        const taskId = setInterval(action, interval);
        const task = {
            name,
            taskId,
            interval
        } as ITaskRecord;

        if (executeRightAway) {
            setTimeout(action, 1000);
        }

        console.log(`Created task [${taskId}]${name}, that will run every ${interval}ms.`)

        this.activeTasks.push(task);
    }
    
    createOnetimeTask(name: string, action: () => void, delay: number) {
        const actionWrapper = () => {
            console.log(`Executing delayed oneshot [${taskId}]${name}`);
            action();
        };
        const taskId = setTimeout(actionWrapper, delay);

        console.log(`Created oneshot task [${taskId}]${name}, that will run in ${delay}ms.`);
    }
}

export default new TaskScheduler();