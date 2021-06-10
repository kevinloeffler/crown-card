// region imports
// modules
import {addMoney, authenticate, chargeMoney, getBalance, validateCard} from './logic.js'
// dotenv
import dotenv from 'dotenv'
dotenv.config()
// express
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import hbs from 'express-handlebars'
const app = express()
const port = process.env.PORT || 3000
// set root directory
const rootPath = process.cwd()
// endregion

// Middleware
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}))
app.set('view engine', 'hbs')
app.set('views', rootPath + '/app/views')
app.engine('hbs', hbs({
    layoutsDir: rootPath + '/app/views/layouts',
    extname: 'hbs',
    defaultLayout: 'main'
}));
app.use(session({
    secret: 'key that will sign the cookie',
    resave: false,
    saveUninitialized: false,
}))


// Routes
app.get('/', function (req, res) {
    req.session.destroy() // reset session
    res.render('home')
    // res.sendFile('./app/index.html', {root: rootPath})
})
/*
app.get('/scripts/main.js',function(req,res){
    res.setHeader('content-type', 'text/javascript')
    res.sendFile('./app/scripts/main.js', {root: rootPath})
})
*/
app.post('/card', async function (req, res) {
    if (!req.session.cardID) {
        if (!authenticate(req.body.password)) {
            res.render('wrongPassword')
        } else {
            if (await validateCard(req.body.cardID)) {
                req.session.cardID = req.body.cardID
                req.session.cookie.maxAge = 6000000 // 10 Minutes
                res.render('card', {cardID: req.session.cardID})
            } else {
                res.send('Invalid Card ID')
            }
        }
    } else {
        console.log('no checks performed, restored session from cookie')
        res.render('card', {cardID: req.session.cardID})
    }
})

app.get('/card', function (req, res) {
    if (!req.session.cardID) {
        res.send('405 Not allowed - Session Expired')
    } else {
        res.render('card', {cardID: req.session.cardID})
    }
})

app.post('/card/charge', async function (req, res) {
    const balance = await getBalance(req.session.cardID)
    res.render('charge', {cardID: req.session.cardID, balance: balance})
})

app.post('/card/charge/success', function (req, res) {
    res.render('success', {activity: 'Charged'})
})

app.post('/card/add', function (req, res) {
    addMoney(req.body.addMoney)
    res.render('add', {cardID: req.session.cardID, amount: req.body.addMoney})
})

app.post('/card/add/success', function (req, res) {
    res.render('success', {activity: 'Added Money'})
})

// Start App

app.listen(port, function () {
    console.log('API is listening on port ' + port);
})
