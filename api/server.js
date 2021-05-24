// region imports
// modules
import {authenticate} from './logic.js'
// dotenv
import dotenv from 'dotenv'
dotenv.config()
// path
// import path from 'path'
// import { fileURLToPath } from 'url'
// const rootPath = path.dirname(fileURLToPath(import.meta.url))
const rootPath = process.cwd()
//express
import express from 'express'
import bodyParser from 'body-parser'
const app = express()
const port = process.env.PORT || 3000
// endregion

// Middleware
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}))


// Routes
app.get('/', function (req, res) {
    res.sendFile('./app/index.html', {root: rootPath})
})

app.get('/scripts/main.js',function(req,res){
    res.setHeader('content-type', 'text/javascript')
    res.sendFile('./app/scripts/main.js', {root: rootPath})
})

app.post('/auth', function (req, res) {
    authenticate(req.body.password)
    res.sendFile('./app/card.html', {root: rootPath})
})


app.get('/page', function (req, res) {
    res.sendFile('./app/page.html', {root: rootPath})
})

app.listen(port, function () {
    console.log('API is listening on port ' + port);
})
