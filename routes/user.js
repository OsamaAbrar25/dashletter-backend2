const express = require('express');
const users = express.Router();
const cookieParser = require('cookie-parser');
const sha256 = require('js-sha256');
const session = require('express-session');
const url = require('url');
const cors = require('cors');
const querystring = require('querystring');
const randomstring = require('randomstring');

con = require('../database/connection');

users.use(cors({exposedHeaders:['set-cookie']}));

//starting frontend
users.get('/', (req, res)=>{
    if (req.session.key) {
        res.redirect('/home');
    } else {
        res.status(400).json({message:'not logged in'});
    }
});

//for login
users.post('/login', (req, res)=>{
    user_email = req.body.email;
    user_password = req.body.password;
    if (user_email.length != 0) {
        hashPass = sha256(user_password);
        var sql = `select * from crendential where email like "${user_email}"`;
        con.query(sql, (err, result)=>{
            if (err) {
                console.log(err.message);
            }
            else if(result.length == 0) {
                res.status(400).json({message:'wrong password and email'});
            } else {
                if(sha256(result[0].password) == hashPass) {
                    req.session.email = result[0].email;
                    req.session.key = randomstring.generate();
                    res.json({message:'user available'});
                } else {
                    res.status(400).json({message:'wrong password and email'});
                }
            }
        });
    } else {
        res.status(400).json({message:'invalid input'});
    }
});

//post request for signup
users.post('/signup', (req, res)=>{

    user_email = req.body.email;
    user_password = req.body.password;
    user_name = req.body.name;
    user_gender = req.body.gender;
    user_dob = req.body.dob;
    user_country = req.body.country;

    if (user_email.length != 0 && user_password.length != 0 && user_name.length != 0 && user_gender.length != 0 && user_dob.length != 0 && user_country.length != 0) {
        token = sha256(user_email);
        var sql = `select * from crendential where email like "${user_email}"`;
        con.query(sql, (err, result)=>{
            if (err) {
                throw err;
            } else if(result.length == 0) {
                var sql = `insert into crendential values("${token}", "${user_email}", "${user_password}")`;
                var sql_user = `insert into user_detail values("${token}","${user_name}","${user_gender}","${user_dob}", "${user_country}")`;
                async function userInsert(){
                    await con.query(sql_user, (err)=>{
                        if(err) {
                            throw err;
                        } else {
                            res.json({message:'user details inserted'});
                        }
                    }).catch(console.log(err));
                }
                userInsert();
                
                con.query(sql, (err)=>{
                    if (err) {
                        throw err;
                    } else {
                        res.json({message:'credentials inserted'});
                    }
                }).catch(console.log(err));

            } else {
                res.json({message:'user already exits'});
            }
        }).catch(console.log(err));
    } else {
        res.status(400).json({message:'bad request'});
    }
    
});

//user main page
users.get('/home', (req, res)=>{
    if (req.session.key) {
        res.json({message:`hello bro you logged in ${req.session.email}`});
    } else {
        res.redirect('/');
    }
    
});

//user logout
users.get('/logout', (req, res)=>{
    if (req.session.key) {
        req.session.destroy( ()=>{
            res.clearCookie('connect.sid', { path: '/' });
            res.json({message:'logged out successfully'});
        });
    } else {
        res.redirect('/');
    }
});

//blog api
users.get('/blog', (req, res)=>{
    blog_category = req.query.category;
    spos = req.query.sp;
    epos = req.query.ep;
    blog_json = require(`../asset/category/${blog_category}.json`);
    blog_json = blog_json.slice(spos, epos);
    res.json(blog_json);
});

module.exports = users