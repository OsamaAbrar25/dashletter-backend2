const mysql = require('mysql')

//create connection
var con = mysql.createPool({
    host:'us-cdbr-iron-east-04.cleardb.net',
    user: 'b46c060415a5f5', 
    password: 'd189f313',
    database: 'heroku_f1f146e523aa9bd'
});

//checking connection
con.connect((err)=>{
    if(err) throw err;
    console.log('connected')
})



module.exports = con
