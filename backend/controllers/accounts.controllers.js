const pool = require('../data/config');
const accountsCtrl = {}


accountsCtrl.getAccounts = (request, response) => {
    pool.query('SELECT * FROM accounts ORDER BY priority', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

accountsCtrl.addAccount = (request, response) => {
    let query = 'INSERT INTO accounts SET ?'
    pool.query(query, request.body,(error, result) => {
        if (error) throw error;
        response.send({message: 'Account Created.'})
    });
}

accountsCtrl.editAccount = (request, response) => {
    const id = request.params.id_account;
    let query = 'UPDATE accounts SET ? WHERE id_account = ?'
    pool.query(query, [request.body, id],(error, result) => {
        if (error) throw error;
        response.send({message: 'Account updated successfully.'})
    });
}

accountsCtrl.deleteAccount = (request, response) => {
    const id = request.params.id_account;
    let query = 'DELETE FROM accounts WHERE id_account = ?'
    pool.query(query, id,(error, result) => {
        if (error) throw error;
        response.send({message: 'Account deleted.'})
    });    

}

module.exports = accountsCtrl