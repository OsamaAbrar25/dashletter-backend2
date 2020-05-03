const express = require('express');
const users = express.Router();
const cookieParser = require('cookie-parser');
const sha256 = require('js-sha256');
const session = require('express-session');
const url = require('url');
const cors = require('cors');
const querystring = require('querystring');
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const verify_email = require('../tools/email_verification');
const { signSendEmailFP } = require('../tools/forgot_password');
const con = require('../database/connection');

//starting frontend
users.get('/', (req, res)=>{
    if (req.session.key) {
        res.redirect('/home');
    } else {
        res.status(400).json({message:'not logged in'});
    }
});

//for login
users.post('/login', [
    check('email').isEmail().not().isEmpty().escape().normalizeEmail(),
    check('password').not().isEmpty().escape(),
],
(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    user_email = req.body.email;
    user_password = req.body.password;
    if (user_email.length != 0) {
        hashPass = sha256(user_password);
        var sql = `select * from crendential where email like ?`;
        con.query(sql, [user_email], (err, result)=>{
            if (err) {
                console.log(err.message);
            }
            else if(result.length == 0) {
                res.status(400).json({message:'wrong password and email'});
            } else {
                if(sha256(result[0].password) == hashPass) {
                    req.session.username = result[0].username;
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
users.post('/signup', [
    check('country').not().isEmpty().escape(),
    check('name').not().isEmpty().escape().trim(),
    check('gender').not().isEmpty().escape(),
    check('dob').not().isEmpty().escape(),
    check('email').not().isEmpty().isEmail().escape().normalizeEmail(),
    check('password').not().isEmpty().escape(),
  ],
(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    user_email = req.body.email;
    user_password = req.body.password;
    user_name = req.body.name;
    user_gender = req.body.gender;
    user_date = req.body.dob;
    user_country = req.body.country;

    date = new Date(user_date);
    user_dob = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    username = user_name.split(' ')[0] + randomstring.generate({length: 7, charset: 'numeric'});
    var sql = `select * from crendential where email like ?`;
    con.query(sql, [user_email], (err, result)=>{
        if (err) {
            console.log(err.message);
        } else if(result.length == 0) {
            var sql = `insert into crendential values(?, ?, ?, false)`;
            var sql_user = `insert into user_detail values(?, ?, ?, ?, ?)`;
            con.query(sql_user, [username, user_name, user_gender, user_dob, user_country], (err)=>{
                if(err) {
                    console.log(err.message);
                } 
            });
            con.query(sql, [username, user_email, sha256(user_password)], (err)=>{
                if (err) {
                    console.log(err.message)
                } else {
                    verify_email.signSendEmail(username, user_email);
                    res.json({message:'credentials inserted confirm your email'});
                }
            });

        } else {
            res.json({message:'user already exits'});
        }
    });   
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
users.get('/blog', [
    check('category').not().isEmpty().escape(),
], 
(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    blog_category = req.query.category;
    spos = req.query.sp;
    epos = req.query.ep;
    blog_json = require(`../asset/category/${blog_category}.json`);
    blog_json = blog_json.slice(spos, epos);
    res.json(blog_json);
});

users.get('/confirmation/:token', [
    check('token').not().isEmpty().escape(),
],
 async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
      var payload = jwt.verify(req.params.token, 'asdf1093KMnzxcvnkljvasdu09123nlasdasdf');
      sql = `UPDATE crendential SET confirmed = true WHERE username like ?`;
      await con.query(sql, [payload.username], (err)=>{
          if(err) {
              console.log(err.message);
          }
      });
      res.send('<h3>Email Verified</h3>');

    } catch (e) {
    res.status(400).send('error');
      console.log(e);
    }

  });

users.get('/verification', (req, res)=>{
    if (req.session.key) {
        verify_email.signSendEmail(req.session.username, req.session.email);
        return res.json({message: 'please verify your email'});
    }
    return res.status(400).json({message: 'Invalid request'});
})

users.post('/reset_password', [
    check('email').isEmail().not().isEmpty().escape().normalizeEmail(),
], 
(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    user_email = req.body.email;
    sql = 'select username, email from crendential where email like ?';
    con.query(sql, [user_email], (err, result)=>{
        if(err) {
            return res.status(400).json({message: err.message});
        }

        if(result.length != 0) {

            check_otp_q = 'select * from check_otp where user_email like ?';
            con.query(check_otp_q, [user_email], (err, rlt)=>{
                if(err){
                    console.log(err.message);
                }
                
                if (rlt.length != 0) {
                    return res.send('otp already send to email');
                }
                otp = randomstring.generate({length: 6, charset: 'numeric'});
            
                insert_query = 'insert into check_otp values(?, ?)';
                con.query(insert_query, [user_email, otp], (err)=>{
                    if (err) {
                        console.log(err.message);
                    }
                });

                signSendEmailFP(otp, user_email);
                return res.json({message: 'Please check your email to reset your password'});
            });
             
        } else {
            return res.status(400).json({message: 'Please enter valid email'});
        }
    });
});

users.post('/verify_otp', [
    check('otp').not().isEmpty().escape(),
    check('password').not().isEmpty().escape(),
],
(req, res) => {
    fp_otp = req.body.otp;
    user_password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    q = 'select user_email from check_otp where otp like ?';
    con.query(q, [fp_otp], (err, result)=>{
        if(err) {
            console.log(err.message);
        }

        if(result.length == 0){
            return res.status(400).send('invalid request');
        }
        q_update = 'UPDATE crendential SET password = ? WHERE email like ?';
        
        con.query(q_update, [user_password, result[0].user_email], (err)=>{
            if(err) {
                console.log(err.message);
            }
        });

        con.query('delete from check_otp where user_email like ?', [result[0].user_email]);

        return res.send('password changed');
    });
    
});
  
module.exports = users