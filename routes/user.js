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
const verify_email = require('../tools/email.js');

con = require('../database/connection');

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
    check('email').isEmail().not().isEmpty().escape().normalizeEmail().withMessage('Your email is not valid'),
    check('password').not().isEmpty().escape().withMessage('Your password is not valid'),
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
    check('country').not().isEmpty().escape().withMessage('Your country is not valid'),
    check('name').not().isEmpty().escape().trim().withMessage('Your name is not valid'),
    check('gender').not().isEmpty().escape().withMessage('Your gender is not valid'),
    check('dob').not().isEmpty().escape().withMessage('Your date of birth is not valid'),
    check('email').not().isEmpty().isEmail().escape().normalizeEmail().withMessage('Your email is not valid'),
    check('password').not().isEmpty().escape().withMessage('Your password is not valid'),
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
    user_dob = req.body.dob;
    user_country = req.body.country;

    if (user_email.length != 0 && user_password.length != 0) {
        token = sha256(user_email);
        var sql = `select * from crendential where email like ?`;
        con.query(sql, [user_email], (err, result)=>{
            if (err) {
                console.log(err.message);
            } else if(result.length == 0) {
                var sql = `insert into crendential values(?, ?, ?, false)`;
                var sql_user = `insert into user_detail values(?, ?, ?, ?, ?)`;
                con.query(sql_user, [token, user_name, user_gender, user_dob, user_country], (err)=>{
                    if(err) {
                        console.log(err.message);
                    } 
                });
                con.query(sql, [token, user_email, user_password], (err)=>{
                    if (err) {
                        console.log(err.message)
                    } else {
                        verify_email.signSendEmail(token, user_email);
                        res.json({message:'credentials inserted confirm your email'});
                    }
                });

            } else {
                res.json({message:'user already exits'});
            }
        });
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
users.get('/blog', [
    check('category').not().isEmpty().escape().withMessage('Your input is not valid'),
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
    check('token').not().isEmpty().escape().withMessage('Your input is not valid'),
],
 async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
      var payload = jwt.verify(req.params.token, 'asdf1093KMnzxcvnkljvasdu09123nlasdasdf');
      sql = `UPDATE crendential SET confirmed = true WHERE crendential_id like ?`;
      await con.query(sql, [payload.id], (err)=>{
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


module.exports = users