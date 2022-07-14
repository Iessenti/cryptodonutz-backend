const Pool = require('pg').Pool
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "password",
    port: 5432,
    database: 'donut',
})

module.exports = pool