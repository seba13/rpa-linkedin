// Require packages and set the port
const express = require('express');
const bodyParser = require('body-parser');  
const routes = require('./routes/routes');
const cors = require('cors')
const morgan = require('morgan')

const port = 3002;
const app = express();
const pool = require('./data/config');



const mysql = require('mysql')

app.use(cors());
app.use(morgan('dev'));
// Use Node.js body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

routes(app)

// Start the server
const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);

    console.log(`Server listening on port ${server.address().port}`);
});