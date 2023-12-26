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
    host : process.env.MYSQL_HOST, 
    port : process.env.MYSQL_PORT, 
    user: process.env.MYSQL_USER, 
    password : process.env.MYSQL_PASSWORD, 
    database : process.env.MYSQL_DATABASE
})


// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())

// JWT verification section 

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN
        , (err, decoded) => {
            if (err) {
                return res.status(403).send({ message: 'Forbidden Access' });
            }
            req.decoded = decoded;
            next();
        })
}




// -------------------------------------------

app.get('/products', (req, res) => {
    const page = req.query.page
    const query = `SELECT * FROM products LIMIT ?, 10`;
    db.query(query,[page*10],(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            res.json(result)
        }   
    })     
})
app.get('/pageCount', (req, res) => {

    const query = `SELECT * FROM products`;
    db.query(query,(err,result)=>{
        if (err) {
            console.log(err)
        } 
        else  { 
            const pageCount = result.length / 10
            res.json(pageCount)
        }   
    })     
})


app.get('/users', (req, res) => {
    const email = req.query.email + '.com';
    const password = req.query.password;

    const query = `SELECT * FROM users 
    WHERE email = '${email}'`;
    db.query(query,(err,result)=>{
        if (result.length > 0) {
            const hash = result[0].pass_word
            bcrypt.compare(password, hash, (err, result) => {              
                if(!result){
                    res.json({message: "Incorrect Password", result : result, accessToken : null},)
                } else {
                    const accessToken = jwt.sign({email}, process.env.ACCESS_TOKEN,{
                        expiresIn : '1d'
                    })
                    res.json({message: "Successfully logged in", result : result, accessToken : accessToken})  
                }
            }); 
        } 
        else  { 
            res.json({message: "No account with this email", result : false, accessToken : null})
        }   
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
    const accessToken = jwt.sign({email}, process.env.ACCESS_TOKEN,{
        expiresIn : '1d'
    })
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
                res.json({message : "User already exists with this email",accessToken : null})
            } else {
                res.json({message : "User created successfully",accessToken : accessToken})    
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