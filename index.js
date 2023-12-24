const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const salt = 10;


const app = express();
const port = process.env.PORT || 5000;


const db = mysql.createPool({
    host : "127.0.0.1",
    port : "3308",
    user: "root",
    password : "12345678",
    database : "test"
})


// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())

// JWT verification section 




// -------------------------------------------


app.get('/users', (req, res) => {
    db.query('SELECT * FROM users',(err,data)=>{
        if(err) {
        res.send(err)
        }
        res.send(data)
    })      
})

app.post('/addUser', async (req, res) => {
    const query = `INSERT INTO users (
        user_name,
        email,
        pass_word
    ) 
    VALUES (?,?,?)`;
    const {userName,email,password} = req.body;
    bcrypt.hash(password, salt, (err,hash)=> {
        if(err){
            console.log(err)
        }
        const data = [
            userName,
            email,
            hash
        ]
        db.query(query,data,(err,result)=>{
            if (err) {
                res.json({message : "User already exists with this email"})
            } else {
                res.json({message : "User created successfully"})    
            }     
        })     
    })   
})




app.get('/', (req, res) => {
    res.send('running ')
})
app.listen(port, () => {
    console.log('crud is running')
})