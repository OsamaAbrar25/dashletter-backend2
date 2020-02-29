const express = require('express')
const users = express.Router()
const cors = require('cors')
const sha256 = require('js-sha256')
const mysql = require('mysql')

users.use(cors())

const con = require('../database/connection')

//starting frontend
users.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../../build', 'index.html'))
})

users.post('/login', (req, res)=>{
    user_email = req.body.email
    user_password = req.body.password
    hashPass = sha256(user_password)
    
    var sql = `select * from login where email like "${user_email}"`
    con.query(sql, (err, result)=>{
        if (err) {
            res.send(`error: ${err.message}`)
        }
        else if(result.length == 0) {
            res.send('wrong password and email')
        } else {
            if(sha256(result[0].password) == hashPass) {
                res.send('user availible')
            } else {
                res.send('wrong password and email')
            }
        }
    })
})

//post request for signup
users.post('/signup', (req, res)=>{

    user_email = req.body.email
    user_password = req.body.password
    token = sha256(user_email)

    var sql = `select * from login where email like "${user_email}"`;
    con.query(sql, (err, result)=>{
        if (err) {
            res.send(`error : ${err.message}`)
        } else if(result.length == 0) {
            var sql = `insert into login values("${token}", "${user_email}", "${user_password}")`
            con.query(sql, (err, result)=>{
                if (err) {
                    res.send(`error : ${err.message}`)
                } else {
                    res.send('credentials inserted')
                }
            })
            
        } else {
            res.send('user already exits')
        }
    })
})

module.exports = users