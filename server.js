const express = require('express');
const app = express();
var compression = require('compression')
const bodyParser = require('body-parser');
const session = require('express-session');
const redis = require('redis');
const cors = require('cors');
const path = require('path');
const redisStore = require('connect-redis')(session);
const cookieParser = require('cookie-parser');
client = redis.createClient(process.env.REDIS_URL);

const port = process.env.PORT || 5000;

const key_secret = '2jUgVJMRs2xunhMNojYX19YlN9MbEA';

app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs')

//middleware
app.use(cors({exposedHeaders:['set-cookie']}));
app.use(compression())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser(key_secret))
app.use(session({
    cookie: {maxAge: 2*60*60*1000, secure:false, httpOnly:true},
    secret:key_secret,
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
   
