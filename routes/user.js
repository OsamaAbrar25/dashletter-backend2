const express = require('express')
const users = express.Router()
const cors = require('cors')
const sha256 = require('js-sha256')
const session = require('express-session')

users.use(cors())

con = require('../database/connection')

//starting frontend
users.get('/', (req, res)=>{
    if (req.session.key) {
        res.redirect('/home');
    } else {
        res.send('Hello not logged in !');
    }
});


//for login
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
                req.session.key = result[0].email;
                res.send('user availible')
            } else {
                res.send('wrong password and email')
            }
        }
    });
});

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
    });
});


//user main page
users.get('/home', (req, res)=>{
    if (req.session.key) {
        res.send('hello bro you logged in');
    } else {
        res.redirect('/');
    }
    
})

//user logout
users.get('/logout', (req, res)=>{
    if (req.session.key) {
        req.session.destroy( ()=>{
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

module.exports = users