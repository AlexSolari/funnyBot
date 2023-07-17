class TaskScheduler {
    constructor(){
        this.activeTasks = [];
    }

    createTask(name, action, interval){
        const taskId = setInterval(action, interval);
        const task = {
            name,
            taskId,
            interval
        };

        console.log(`Created task [${taskId}]${name}, that will run every ${interval}ms.`)

        this.activeTasks.push(task);
    }
}

module.exports = new TaskScheduler();