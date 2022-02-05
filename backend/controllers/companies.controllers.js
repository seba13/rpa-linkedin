const pool = require('../data/config');
const companiesCtrl = {}


companiesCtrl.getCompanies = (request, response) => {
    pool.query('SELECT * FROM companies', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

companiesCtrl.getCompaniesBetweenDates = (request, response) => {
    
    let from = new Date(request.body.from)
    let to = new Date(request.body.to)

    let query = 'SELECT * FROM companies WHERE (date BETWEEN ? AND ?)'

    pool.query(query,[from, to], (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}


module.exports = companiesCtrl