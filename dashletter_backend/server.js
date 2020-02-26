const express = require('express')
const app = express()
const path = require('path')

const port = 4000

//including client side file
app.use(express.static(path.join(__dirname, '../build')))

//starting fronteOsamaAbrar25/dashletter-backend2.gitnd
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

//hosting at localhost:4000
app.listen(port, (err)=>{
    if (err) {
        console.log(err)
    } else {
        console.log(`server started at ${port}`)
    }
})