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
    
    const accessToken = req.query.accessToken;
    if (!accessToken) {
        return res.status(401);
    }
    jwt.verify(accessToken, process.env.ACCESS_TOKEN
        , (err, decoded) => {
            if (err) {
                return res.status(403);
            }
            req.decoded = decoded;
            next();
        })
}

// -------------------------------------------

app.get('/cart', verifyJWT, (req, res) => {
    const decoded = req.decoded.email
    const query = `SELECT o.productId, productName, image, o.quantity, price, o.quantity * price AS totalPrice  
    FROM orders o 
    JOIN products p 
        ON o.productId = p.productId
        WHERE email = '${decoded}'`;

    db.query(query,(err,result)=>{
        if (result.length > 0) {
            res.status(200).send(result)
        } else {
            res.status(500).send("Internal server error")            
        }
      
    })    
})


app.post('/addToCart', verifyJWT, (req, res) => {
    const {productId} = req.body;
    const decoded = req.decoded.email
    const query = `SELECT orderId FROM orders WHERE email = '${decoded}' AND productId = ${productId}`;


    db.query(query,(err,result)=>{
        if (result.length === 1) {
            const updateQuery = `UPDATE orders SET quantity = quantity + 1 WHERE orderId = '${result[0].orderId}'`
            db.query(updateQuery,(err,result)=>{
                if (err) {
                    res.status(404).send("Not Found");
                } else {
                    res.status(200).send("Successfully Updated")
                }
            })
            
        } else {
            const insertQuery = `INSERT INTO orders (
                email,
                productId,
                quantity
            ) 
            VALUES ('${decoded}','${productId}','1')`;
            
            db.query(insertQuery,(err,result)=>{
                if (err) {
                    res.status(500).send("Internal server error")
                } else {
                    res.status(200).send("Successfully added")    
                }     
            }) 
            
        }
      
    })    
})

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
    const currentDate = new Date()
    const password = req.query.password;

    const data = {email : email, date : currentDate}

    const query = `SELECT * FROM users 
    WHERE email = '${email}'`;
    db.query(query,(err,result)=>{
        if (result.length > 0) {
            const hash = result[0].pass_word
            bcrypt.compare(password, hash, (err, result) => {              
                if(!result){
                    res.json({message: "Incorrect Password", result : result, accessToken : null},)
                } else {
                    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN,{
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
    const currentDate = new Date()
    const data = {email : email, date : currentDate}

    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN,{
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

app.delete('/product',verifyJWT, (req, res) => {
    const productId = req.query.productId 
    const decoded = req.decoded.email 

    const query = `DELETE FROM orders WHERE email = '${decoded}' AND productId = '${productId}'`;
    db.query(query,(err,result)=>{
        if (err) {
            res.status(500).send("Internal server error")     
        } 
        else  { 
            res.status(200).send("Item Removed")
        }   
    })     
})




app.get('/', (req, res) => {
    res.send('running ')
})
app.listen(port, () => {
    console.log('crud is running')
})




