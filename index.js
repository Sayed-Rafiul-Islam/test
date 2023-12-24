const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const mysql = require('mysql2');


const app = express();
const port = process.env.PORT || 5000;


const db = mysql.createPool({
    host : "sql12.freesqldatabase.com",
    port : "3306",
    user: "sql12672567",
    password : "qhS2gjszTT",
    database : "sql12672567"
})


// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())

// JWT verification section 




// -------------------------------------------


app.get('/books', (req, res) => {
    db.query('SELECT * FROM books',(err,data)=>{
        if(err) {
        res.send(err)
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