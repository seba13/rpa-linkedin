const pool = require('../data/config');
const logsCtrl = {}


logsCtrl.getLogs = (request, response) => {
    pool.query('SELECT * FROM logs', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}


module.exports = logsCtrl