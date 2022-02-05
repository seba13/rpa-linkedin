const pool = require('../data/config');
const followersCtrl = {}


followersCtrl.getReactions = (request, response) => {
    pool.query('SELECT * FROM reactions', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

followersCtrl.getCompanyFollowers = (request, response) => {
    let query = 'SELECT * FROM followers WHERE idCompany = ?'
    pool.query(query,request.params.id_company, (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

followersCtrl.queryFollowersBetweenDates =  (request, response) => {
    let from = new Date(request.body.from)
    let to = new Date(request.body.to)

    let query = 'SELECT * FROM followers WHERE (follow_date BETWEEN ? AND ? ) AND idCompany = ?'

    pool.query(query,[from, to, request.params.id_company], (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}


module.exports = followersCtrl