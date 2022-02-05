const mysql = require('mysql');

// Create a MySQL pool
const pool = mysql.createPool({
    host: "localhost",
    database: "demoLinkedinScrapper3",
    user: "root",
    password: "",
    port:3306
});




// Export the pool
module.exports = pool;