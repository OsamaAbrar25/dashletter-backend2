const mysql = require('mysql')

//create connection
var con = mysql.createConnection({
    host:'localhost',
    user: 'root', 
    password: '0184',
    database: 'dashletter'
});

//checking connection
con.connect((err)=>{
    if(err) throw err;
    console.log('connected')
})

module.exports = con
