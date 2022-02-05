const pool = require('../data/config');
const commentsCtrl = {}


commentsCtrl.getComments = (request, response) => {
    pool.query('SELECT * FROM comments', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

commentsCtrl.getPostComments = (request, response) => {

    let query = 'SELECT * FROM comments WHERE idPost = ?'

    pool.query(query,request.params.id_post, (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

commentsCtrl.getPostCommentsBetweenDates = (request, response) => {

    let from = new Date(request.body.from)
    let to = new Date(request.body.to)

    let query = 'SELECT * FROM comments WHERE (published_date BETWEEN ? AND ? ) AND idPost = ? ORDER BY published_date DESC'

    pool.query(query,[from, to, request.params.id_post], (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

commentsCtrl.getCompanyComments = (request, response) => {
    let query = 'SELECT co.id_comment, co.idPost, co.name, co.job, co.comment, co.sentiment, co.url_user, co.published_date FROM companies AS c JOIN posts AS p ON p.idCompany = c.id_company RIGHT JOIN comments AS co ON co.idPost = p.id_post WHERE id_company = ?'
    pool.query(query, request.params.id_company,(error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

module.exports = commentsCtrl