const pool = require('../data/config');
const usersCtrl = {}


usersCtrl.getUsers = (request, response) => {
    pool.query('SELECT * FROM users', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

usersCtrl.getUser = (request, response) => {
    let query = 'SELECT * FROM users WHERE url_user = ?'
    pool.query(query,request.body.url_user, (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

usersCtrl.getCompanyUsers = (request, response) => {
    let query = 'SELECT c.name_company, u.name, u.job, u.number_followers, u.education, u.experience, u.url_user FROM companies AS c INNER JOIN users AS u ON c.id_company = u.idCompany WHERE idCompany = ? ORDER BY u.number_followers DESC'
    pool.query(query, request.params.id_company,(error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

module.exports = usersCtrl