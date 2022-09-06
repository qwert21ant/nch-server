const Pool = require('pg').Pool
const pool = new Pool({
    user: "nch",
    password: "lapopa228",
    host: "localhost",
    port: 5432,
    database: "nearcrowddb"
})

module.exports = pool
