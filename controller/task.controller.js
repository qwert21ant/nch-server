const db = require("../db")
const userController = require("./user.controller")
const Log = require("../log")

async function addTask(task_id, answers, user){
    try {
        await db.query('INSERT INTO task (id, answers) values ($1, $2)',
            [task_id, answers]);
        Log.log(`Task ${task_id} was added by ${user}`);
        return {status: "added"};
    } catch(err) {
        Log.log(`Error on add task ${task_id} by ${user}`);
        Log.log(err);
        return {status: "error", error: err.message};
    }
}

async function updateTask(task_id, answers, user){
    try {
        await db.query('UPDATE task set answers = $1 where id = $2',
            [answers, task_id]);
        Log.log(`Task ${task_id} was updated by user ${user}`);
        return {status: "updated"};
    } catch(err) {
        Log.log(`Error on update task ${task_id} by ${user}`);
        Log.log(err);
        return {status: "error", error: err.message};
    }
}

async function deleteTask(task_id, user){
    try {
        await db.query('DELETE FROM task WHERE id = $1', [taks_id]);
        return {staus: "deleted"};
    } catch(err) {
        Log.log(`Error on delete task ${task_id} by ${user}`);
        Log.log(err);
        return {status: "error", error: err.message};
    }
}

async function setTask(task_id, answers, user){
    const cur_answers = await db.query('SELECT answers FROM task WHERE id = $1', [task_id]);

    if(cur_answers.rowCount)
        return updateTask(task_id, answers, user);
    else
        return addTask(task_id, answers, user);
}

async function findTask(task_id, user){
    try {
        const answers = await db.query('SELECT answers FROM task where id = $1', [task_id]);

        if(answers.rowCount){
            Log.log(`Task ${task_id} was found by user ${user}`);
            return {status: "task found", answers: answers.rows[0].answers};
        } else {
            Log.log(`Task ${task_id} was NOT found by user ${user}`);
            return {status: "task not found"};
        }
    } catch(err) {
        Log.log(`Error on update task ${task_id} by ${user}`);
        Log.log(err);
        return {status: "error", error: err.message};
    }
}

class TaskController{
    async processRequest(req, res){
        var {task_id, task_info, operation, key, answers} = req.body;
        if(task_info) task_id = JSON.parse(task_info).id;
        //const task_resub = task_info.resubmits;

        const fingerprint = req.fingerprint.hash
        let user = await userController.checkUser(req.ip, key, fingerprint);

        if(user != -1){
            if(operation === "set")
                setTask(task_id, answers, user).then(x => res.json(x));

            else if(operation === "find")
                findTask(task_id, user).then(x => res.json(x));

            else {
                Log.log(`ERROR: operation ${operation} undefined, by ${req.ip}`)
                res.json({status: "error", error: "operation undefined"})
            }
        } else {
            user = await userController.getUserNameByKey(key);
            if(user == -1)
                Log.log("Unknown user:\n IP: " + req.ip +
                    "\n Key: " + key +
                    "\n Fingerprint: " + fingerprint);
            else
                Log.log("Unknown user with " + user + "'s key:\n IP: " + req.ip +
                    "\n Fingerprint: " + fingerprint);

            res.json({status: "error", error: "user not found"})
        }
    }
}

module.exports = new TaskController()