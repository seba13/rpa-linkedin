const pool = require('../data/config');
const reactionsCtrl = {}

//exports csv
const createCsvWriter = require("csv-writer").createObjectCsvWriter;


reactionsCtrl.getReactions = (request, response) => {
    pool.query('SELECT * FROM reactions', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

reactionsCtrl.getCompanyReactions = (request, response) => {
    let query = 'SELECT r.id_reaction, r.idPost, r.name, r.job, r.reaction, r.url_user FROM companies AS c JOIN posts AS p ON p.idCompany = c.id_company RIGHT JOIN reactions AS r ON r.idPost = p.id_post WHERE id_company = ?'
    pool.query(query, request.params.id_company,(error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

reactionsCtrl.getPostReactions = (request, response) => {
    let query = 'SELECT * FROM reactions WHERE idPost = ?'
    pool.query(query,request.params.id_post, (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}



module.exports = reactionsCtrl