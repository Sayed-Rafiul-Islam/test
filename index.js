const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const connection = require('./connection')
require('dotenv').config()


const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())

// JWT verification section 




// --------------------------------------------


app.get('/books', (req, res) => {
    connection.query('SELECT * FROM books',(err,data)=>{
        if(err) {
            console.log(err)
        }
        res.send(data)
        
    })      
})




app.get('/', (req, res) => {
    res.send('running ')
})
app.listen(port, () => {
    console.log('crud is running')
})