class TaskScheduler {
    constructor() {
        this.activeTasks = [];
    }

    /**
     * @param {string} name 
     * @param {() => void} action 
     * @param {number} interval interval in milliseconds
     * @param {boolean} executeRightAway 
     */
    createTask(name, action, interval, executeRightAway) {
        executeRightAway = executeRightAway ?? false;
        const taskId = setInterval(action, interval);
        const task = {
            name,
            taskId,
            interval
        };

        if (executeRightAway) {
            setTimeout(action, 1000);
        }

        console.log(`Created task [${taskId}]${name}, that will run every ${interval}ms.`)

        this.activeTasks.push(task);
    }
    
    /**
     * @param {string} name 
     * @param {() => void} action 
     * @param {number} delay delay in milliseconds
     */
    createOnetimeTask(name, action, delay) {
        const actionWrapper = () => {
            console.log(`Executing delayed oneshot [${taskId}]${name}]`);
            action();
        };
        const taskId = setTimeout(actionWrapper, delay);

        console.log(`Created oneshot task [${taskId}]${name}, that will run in ${delay}ms.`);
    }
}

export default new TaskScheduler();