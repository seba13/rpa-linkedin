const pool = require('../data/config');
const postsCtrl = {}


postsCtrl.getPosts = (request, response) => {
    console.log("ACAAAAAAAAaaaaaaaaaaaaaaa")
    pool.query('SELECT * FROM posts ORDER BY published_date DESC', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

postsCtrl.getPostsCompany = (request, response) => {

    let query = 'SELECT * FROM posts WHERE idCompany = ? ORDER BY published_date DESC'

    pool.query(query,request.params.id_company, (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

postsCtrl.getPostCompaniesBetweenDates = (request, response) => {

    let from = new Date(request.body.from)
    let to = new Date(request.body.to)

    let query = 'SELECT * FROM posts WHERE (published_date BETWEEN ? AND ? ) AND idCompany = ?  ORDER BY published_date DESC'

    pool.query(query,[from, to, request.params.id_company], (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

postsCtrl.getPostReactionsBetweenDates = (request, response) => {

    let from = new Date(request.body.from)
    let to = new Date(request.body.to)

    let query = 'SELECT c.name_company,c.followers,c.date,p.id_post,p.description, p.tag,p.published_date, r.reaction,r.name,r.job,r.url_user FROM companies AS c INNER JOIN posts AS p ON c.id_company=p.idCompany RIGHT JOIN reactions AS r ON p.id_post = r.idPost WHERE (p.published_date BETWEEN ? AND ? ) AND idCompany = ?  ORDER BY p.published_date DESC'

    pool.query(query,[from, to, request.params.id_company], (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

postsCtrl.getPostCommentsBetweenDates = (request, response) => {

    let from = new Date(request.body.from)
    let to = new Date(request.body.to)

    let query = 'SELECT c.name_company,c.followers,c.date,p.id_post,p.description, p.tag,p.published_date, co.comment,co.sentiment,co.name,co.job,co.url_user FROM companies AS c INNER JOIN posts AS p ON c.id_company=p.idCompany RIGHT JOIN comments AS co ON p.id_post = co.idPost WHERE (p.published_date BETWEEN ? AND ? ) AND idCompany = ?  ORDER BY p.published_date DESC'

    pool.query(query,[from, to, request.params.id_company], (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

postsCtrl.editPost = (request, response) => {
    const id = request.params.id_post;
    let query = 'UPDATE posts SET tag = ? WHERE id_post = ?'
    pool.query(query, [request.body.tag, id],(error, result) => {
        if (error) throw error;
        response.send({message: 'Post updated successfully.'})
    });
}

postsCtrl.getTags = (request, response) => {
    let query = 'select * from tags'
    pool.query(query, (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}


module.exports = postsCtrl