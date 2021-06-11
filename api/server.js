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
    res.render('home', {
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        db: process.env.DATABASE,
        pw: process.env.DATABASE_PW,
    })
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
                const balance = await getBalance(req.session.cardID)
                res.render('card', {cardID: req.session.cardID, balance: balance, cardHolder: 'Jane Doe'})
            } else {
                res.send('Invalid Card ID')
            }
        }
    } else {
        console.log('no checks performed, restored session from cookie')
        const balance = await getBalance(req.session.cardID)
        res.render('card', {cardID: req.session.cardID, balance: balance, cardHolder: 'Jane Doe'})
    }
})

app.get('/card', async function (req, res) {
    if (!req.session.cardID) {
        res.send('405 Not allowed - Session Expired')
    } else {
        const balance = await getBalance(req.session.cardID)
        res.render('card', {cardID: req.session.cardID, balance: balance, cardHolder: 'Jane Doe'})
    }
})

app.post('/card/charge', async function (req, res) {
    const balance = await getBalance(req.session.cardID)
    res.render('charge', {cardID: req.session.cardID, balance: balance})
})

app.post('/card/charge/complete', async function (req, res) {
    if (await chargeMoney(req.session.cardID, req.body.newBalance)) {
        res.render('success', {activity: 'Charged'})
    } else {
        res.render('failed')
    }
})

app.post('/card/add', async function (req, res) {
    const balance = await getBalance(req.session.cardID)
    res.render('add', {cardID: req.session.cardID, balance: balance})
})

app.post('/card/add/complete', async function (req, res) {
    if (await addMoney(req.session.cardID, req.body.newBalance)) {
        res.render('success', {activity: 'Added Money'})
    } else {
        res.render('failed')
    }
})

// Start App

app.listen(port, function () {
    console.log('API is listening on port ' + port);
})
