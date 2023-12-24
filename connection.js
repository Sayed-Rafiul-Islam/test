const mysql = require('mysql2');

const mysqlConnection = mysql.createConnection({
    host : "localhost",
    port : "3308",
    user: "root",
    password : "12345678",
    database : "test"
})

mysqlConnection.connect((err,data)=>{
    if(err) {
        console.log(err)
    }
    else {
        console.log("db connected")
    }
})

module.exports=mysqlConnection