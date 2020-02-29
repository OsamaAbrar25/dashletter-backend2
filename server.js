const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const port = process.env.PORT || 5000

//including client side file


//including json parser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


var Users = require('./routes/user')
app.use('', Users)

//hosting at localhost:4000
app.listen(port, (err)=>{
    if (err) {
        console.log(err)
    } else {
        console.log(`server started at ${port}`)
    }
})
   
