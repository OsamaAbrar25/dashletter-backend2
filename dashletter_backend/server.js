const express = require('express')
const app = express()
const path = require('path')

const port = 4000

//including client side file
app.use(express.static(path.join(__dirname, '../dashletter_frontend-master/build')))

//starting frontend
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../dashletter_frontend-master/build', 'index.html'))
})

//hosting at localhost:4000
app.listen(port, (err)=>{
    if (err) {
        console.log(err)
    } else {
        console.log(`server started at ${port}`)
    }
})
