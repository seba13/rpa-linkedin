const pool = require('../data/config');
const extractionsCtrl = {}


extractionsCtrl.getExtractions = (request, response) => {
    pool.query('SELECT * FROM extractions ORDER BY priority', (error, result) => {
        if (error) throw error;
        response.send(result);
    });
}

extractionsCtrl.addExtraction = (request, response) => {
    request.body['creation_date'] = new Date();
    console.log(request.body['creation_date']);
    let query = 'INSERT INTO extractions SET ?'

    pool.query(query, request.body,(error, result) => {
        if (error) throw error;
        response.send({message: 'Extraction Created.'})
    });
}

extractionsCtrl.editExtraction = (request, response) => {
    const id = request.params.id_extraction;
    let query = 'UPDATE extractions SET ? WHERE id_extraction = ?'
    pool.query(query, [request.body, id],(error, result) => {
        if (error) throw error;
        response.send({message: 'Extraction updated successfully.'})
    });
}

extractionsCtrl.deleteExtraction = (request, response) => {
    const id = request.params.id_extraction;
    let query = 'DELETE FROM extractions WHERE id_extraction = ?'
    pool.query(query, id,(error, result) => {
        if (error) throw error;
        response.send({message: 'Extraction deleted.'})
    });    

}

module.exports = extractionsCtrl