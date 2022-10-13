const db = require("../db")
const userController = require("./user.controller")
const Log = require("../log")

async function addTask(task_info, answers, user){
    try {
        await db.query('INSERT INTO tasks values ($1, $2, $3, $4, $5)',
            [task_info.id, task_info.author, task_info.reviewer, task_info.resubmits, answers]);

        Log.log(`Task ${task_info.id} was added by ${user.name}`);
        return {status: "added"};
    } catch(err) {
        Log.log(`Error on add task ${task_info.id} by ${user.name}`);
        Log.log(err);
        return {status: "error", error: err.message};
    }
}
 
async function updateTask(task_info, answers, user){
    try {
        await db.query(`
        UPDATE tasks set
            author = (case when $2::integer is null then author else $2::integer end),
            reviewer = (case when $3::integer is null then reviewer else $3::integer end),
            resubmits = $4,
            answers = $5
            where id = $1`,
            [task_info.id, task_info.author, task_info.reviewer, task_info.resubmits, answers]
        );

        Log.log(`Task ${task_info.id} was updated by user ${user.name}`);
        return {status: "updated"};
    } catch(err) {
        Log.log(`Error on update task ${task_info.id} by ${user.name}`);
        Log.log(err);
        return {status: "error", error: err.message};
    }
}

/*async function deleteTask(task_info, user){
    try {
        await db.query('DELETE FROM tasks WHERE id = $1', [taks_info.id]);
        return {staus: "deleted"};
    } catch(err) {
        Log.log(`Error on delete task ${task_info.id} by ${user.name}`);
        Log.log(err);
        return {status: "error", error: err.message};
    }
}*/

async function setTask(task_info, answers, user){
    const cur_answers = await db.query('SELECT answers FROM tasks WHERE id = $1', [task_info.id]);

    if(cur_answers.rowCount)
        return updateTask(task_info, answers, user);
    else
        return addTask(task_info, answers, user);
}

async function findTask(task_info, user){
    try {
        const answers = await db.query('SELECT * FROM tasks where id = $1', [task_info.id]);

        if(answers.rowCount){
            var task = answers.rows[0];
            Log.log(`Task ${task_info.id} was found by user ${user.name}`);
            return {
                status: "task found",
                task_info: {
                    id: task.id,
                    author: (task.author ? 'known' : 'unknown'),
                    resubmits: task.resubmits
                },
                answers: task.answers
            };
        } else {
            Log.log(`Task ${task_info.id} was NOT found by user ${user.name}`);
            return {status: "task not found"};
        }
    } catch(err) {
        Log.log(`Error on find task ${task_info.id} by ${user.name}`);
        Log.log(err);
        return {status: "error", error: err.message};
    }
}

class TaskController{
    async processRequest(req, res){
        const {task_id, operation, key, answers} = req.body;

        var task_info = req.body.task_info ? req.body.task_info : {
            id: task_id,
            resubmits: null,
            mode: 'review'
        };

        let user = await userController.getUser(key);

        if(user){
            task_info.author = task_info.mode == 'task' ? user.id : null;
            task_info.reviewer = task_info.mode == 'review' ? user.id : null;
  
            if(operation === "set"){
                if(!answers){
                    Log.log(`ERROR: no answers provided from ${user.name}`);
                    res.json({status: "error", error: "no answers provided"});
                    return;
                }
                setTask(task_info, answers, user).then(x => res.json(x));

            } else if(operation === "find")
                findTask(task_info, user).then(x => res.json(x));

            else {
                Log.log(`ERROR: operation ${operation} undefined, by ${user.name}`)
                res.json({status: "error", error: "operation undefined"})
            }
        } else {
            Log.log(`Unknown user: key = ${key}`);

            res.json({status: "error", error: "user not found"})
        }
    }
}

module.exports = new TaskController()