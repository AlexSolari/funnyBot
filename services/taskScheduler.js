class TaskScheduler {
    constructor(){
        this.activeTasks = [];
    }

    createTask(name, action, interval, executeRightAway){
        executeRightAway = executeRightAway || false;
        const taskId = setInterval(action, interval);
        const task = {
            name,
            taskId,
            interval
        };

        if (executeRightAway){
            setTimeout(action, 1000);
        }

        console.log(`Created task [${taskId}]${name}, that will run every ${interval}ms.`)

        this.activeTasks.push(task);
    }
}

module.exports = new TaskScheduler();