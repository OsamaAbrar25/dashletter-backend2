const express = require('express');
const users = express.Router();
const cors = require('cors');
const sha256 = require('js-sha256');
const session = require('express-session');
const url = require('url');
const querystring = require('querystring');
const randomstring = require('randomstring');

users.use(cors());

con = require('../database/connection');

//starting frontend
users.get('/', (req, res)=>{
    if (req.session.key) {
        res.redirect('/home');
    } else {
        res.status(400).send('Hello not logged in !');
    }
});

//for login
users.post('/login', (req, res)=>{
    user_email = req.body.email;
    user_password = req.body.password;
    hashPass = sha256(user_password);

    var sql = `select * from login where email like "${user_email}"`;
    con.query(sql, (err, result)=>{
        if (err) {
            res.send(`error: ${err.message}`);
        }
        else if(result.length == 0) {
            res.status(400).send('wrong password and email');
        } else {
            if(sha256(result[0].password) == hashPass) {
                req.session.email = result[0].email;
                req.session.key = randomstring.generate();
                res.send('user availible');
            } else {
                res.status(400).send('wrong password and email');
            }
        }
    });
});

//post request for signup
users.post('/signup', (req, res)=>{

    user_email = req.body.email;
    user_password = req.body.password;
    if (user_email.length != 0 && user_password.length != 0) {
        token = sha256(user_email);
        var sql = `select * from login where email like "${user_email}"`;
        con.query(sql, (err, result)=>{
            if (err) {
                res.send(`error : ${err.message}`);
            } else if(result.length == 0) {
                var sql = `insert into login values("${token}", "${user_email}", "${user_password}")`;
                con.query(sql, (err, result)=>{
                    if (err) {
                        res.send(`error : ${err.message}`);
                    } else {
                        res.send('credentials inserted');
                    }
                });

            } else {
                res.send('user already exits');
            }
        });
    } else {
        res.status(400).send('bad request');
    }
    
});

//user main page
users.get('/home', (req, res)=>{
    if (req.session.key) {
        res.send('hello bro you logged in');
    } else {
        res.redirect('/');
    }
    
});

//user logout
users.get('/logout', (req, res)=>{
    if (req.session.key) {
        req.session.destroy( ()=>{
            res.clearCookie('connect.sid', { path: '/' });
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

//blog api
users.get('/blog', (req, res)=>{
    blog_category = req.query.category;
    blog_json = require(`../asset/category/${blog_category}.json`);
    res.json(blog_json);
});

module.exports = users