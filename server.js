const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const randomstring = require('randomstring');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const cookieParser = require('cookie-parser');
client = redis.createClient(process.env.REDIS_URL);

const port = process.env.PORT || 5000;

//including json parser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser(randomstring.generate()))
app.use(session({
    secret:randomstring.generate(),
    store: new redisStore({
        host: process.env.REDIS_HOST, 
        password: process.env.REDIS_PASSWORD, 
        port: process.env.REDIS_PORT, 
        client: client
    }),
    resave:false,
    saveUninitialized:false
}));

var Users = require('./routes/user')
app.use(Users)

//hosting at localhost:4000
app.listen(port, (err)=>{
    if (err) {
        console.log(err)
    } else {
        console.log(`server started at ${port}`)
    }
})
   
