const db = require("../db")
const Log = require("../log")

class UserController {
    async getUser(key){
        const name = await db.query('SELECT id, name FROM users where key = $1',
            [key]);

        return name.rowCount ? name.rows[0] : null;
    }

    async addUser(name, key){
        const role = await db.query('SELECT role FROM users where name = $1', [name])
        if(!role.rowCount){
            try {
                await db.query('INSERT INTO users (name, key, role) values ($1, $2, $3)',
                    [name, key, "user"])
                await Log.log(`user with key ${key} successfully added`)
                return "user successfully added"
            } catch(err) {
                await Log.log("ERROR on adding user")
                await Log.log(err)
                return "error"
            }
        } else return `user ${name} already exists`
    }

    async deleteUser(name){
        const role = await db.query('SELECT role FROM users where name = $1', [name])

        if(role.rowCount){
            await db.query('DELETE FROM users where name = $1', [name])
            await Log.log(`user ${name} successfully deleted`)
            return "user successfully deleted"
        }else return "user not exists"
    }

    async getUserId(name){
        try {
            const id = await db.query('SELECT id FROM users where name = $1', [name])
            if(id.rowCount)
                return id.rows[0].id
            else
                return "user not exists"
        } catch(err) {
            await Log.log("ERROR on getting user id")
            await Log.log(err)
            return "error"
        }
    }

    async getUserNameByKey(key){
        try {
            const name = await db.query('SELECT name FROM users WHERE key = $1', [key]);
            if(name.rowCount)
                return name.rows[0].name;
            else
                return -1;
        } catch(err) {
            Log.log("Error in getUserNameByKey")
            Log.log(err);
            return -1;
        }
    }

    async getAllUsers(){
        const users = await db.query('SELECT name FROM users')
        return users.rows
    }

    async getUserInfo(name, row){
        const info = await db.query('SELECT * FROM users WHERE name = $1',
            [name]);
        return info.rows ? info.rows[0][row] : null;
    }

    async changeUserInfo(name, row, new_value){
        let res = await db.query('UPDATE users SET ' +
            {ip: "ip", key: "key", fingerprint: "fingerprint"}[row] +
            ' = $1 WHERE name = $2',
            [new_value, name]);
        console.log(res);
        return res;
    }
}

module.exports = new UserController()