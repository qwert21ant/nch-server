const Pool = require('pg').Pool
const pool = new Pool({
    user: "nch",
    password: process.env.DB_PWD,
    host: "localhost",
    port: 5432,
    database: "nearcrowddb"
})

module.exports = pool
