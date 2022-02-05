
const companiesCtrl = require('../controllers/companies.controllers')
const commentsCtrl = require('../controllers/comments.controllers')
const postsCtrl = require('../controllers/posts.controllers')
const reactionsCtrl = require('../controllers/reactions.controllers')
const usersCtrl = require('../controllers/users.controllers')
const followersCtrl = require('../controllers/followers.controllers')
const extractionsCtrl = require('../controllers/extractions.controllers')
const accountsCtrl = require('../controllers/accounts.controllers')



// Display all companies
const router = app => {
    app.get('/', (request, response) => {
        response.send({
            message: 'Node.js and Express REST API'
        });
    });

    //extractions routes
    app.get('/api/extractions', extractionsCtrl.getExtractions);
    app.post('/api/extractions', extractionsCtrl.addExtraction);
    app.put('/api/extractions/:id_extraction', extractionsCtrl.editExtraction);
    app.delete('/api/extractions/:id_extraction', extractionsCtrl.deleteExtraction);

    // accounts routes
    app.get('/api/accounts', accountsCtrl.getAccounts);
    app.post('/api/accounts', accountsCtrl.addAccount);
    app.put('/api/accounts/:id_account', accountsCtrl.editAccount);
    app.delete('/api/accounts/:id_account', accountsCtrl.deleteAccount);

    //companies routes
    app.get('/api/companies', companiesCtrl.getCompanies);
    app.post('/api/companies/query_between_dates', companiesCtrl.getCompaniesBetweenDates);

    //comments routes
    app.get('/api/comments', commentsCtrl.getComments);
    app.get('/api/comments/:id_post', commentsCtrl.getPostComments);
    app.post('/api/comments/:id_post/query_between_dates', commentsCtrl.getPostCommentsBetweenDates);
    app.get('/api/comments/company/:id_company',commentsCtrl.getCompanyComments)

    //posts routes
    app.get('/api/posts',postsCtrl.getPosts);
    app.get('/api/posts/:id_company', postsCtrl.getPostsCompany);
    app.post('/api/posts/:id_company/query_between_dates', postsCtrl.getPostCompaniesBetweenDates);
    app.post('/api/posts/:id_company/reactions_between_dates', postsCtrl.getPostReactionsBetweenDates);
    app.post('/api/posts/:id_company/comments_between_dates', postsCtrl.getPostCommentsBetweenDates);
    app.get('/api/posts/post/category/tags', postsCtrl.getTags);
    app.put('/api/posts/post/category/update/:id_post', postsCtrl.editPost);
    
    //reactions routes
    app.get('/api/reactions', reactionsCtrl.getReactions);
    app.get('/api/reactions/:id_post', reactionsCtrl.getPostReactions);
    app.get('/api/reactions/company/:id_company', reactionsCtrl.getCompanyReactions);

    //users routes
    app.get('/api/users', usersCtrl.getUsers);
    app.post('/api/users/info', usersCtrl.getUser);
    app.get('/api/users/:id_company', usersCtrl.getCompanyUsers);

    //followers routes
    app.get('api/followers/:id_company', followersCtrl.getCompanyFollowers)
    app.post('api/followers/:id_company/query_between_dates', followersCtrl.queryFollowersBetweenDates)



    
}

module.exports = router;