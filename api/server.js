// region imports
// modules
import {
    addMoney,
    authenticate,
    chargeMoney,
    createNewCard,
    deactivateCard,
    getBalance,
    getCardHolder,
    validateCard
} from './logic.js'
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
app.use(express.static(rootPath + '/app/public'))
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
})

app.post('/card', async function (req, res) {
    if (!req.session.cardID) {
        if (!authenticate(req.body.password)) {
            res.render('wrongPassword')
        } else {
            const cardStatus = await validateCard(req.body.cardID)
            if (cardStatus === 1) {
                req.session.cardID = req.body.cardID
                req.session.cookie.maxAge = 6_000_000 // 10 Minutes

                const balance = await getBalance(req.session.cardID)
                const cardHolder = await getCardHolder(req.session.cardID)

                res.render('card', {cardID: req.session.cardID, balance: balance, cardHolder: cardHolder})
            } else if (cardStatus === 0) {
                req.session.cardID = req.body.cardID
                req.session.cookie.maxAge = 6_000_000 // 10 Minutes

                res.render('create', {cardID: req.session.cardID})
            } else {
                res.send('Invalid Card ID')
            }
        }
    } else {
        const balance = await getBalance(req.session.cardID)
        res.render('card', {cardID: req.session.cardID, balance: balance, cardHolder: 'Jane Doe'})
    }
})

app.post('/create/holder', function (req, res) {
    if (!req.session.cardID) {
        res.send('405 Not allowed - Session Expired')
    } else {
        res.render('create-holder', {cardID: req.session.cardID})
    }
})

app.post('/create/balance', function (req, res) {
    if (!req.session.cardID) {
        res.send('405 Not allowed - Session Expired')
    } else {
        res.render('create-balance', {name: req.body.name, mail: req.body.email, password: req.body.password})
    }
})

app.post('/create/complete', async function (req, res) {
    if (!req.session.cardID) {
        res.send('405 Not allowed - Session Expired')
    } else {
        await createNewCard(req.session.cardID, req.body.balance, req.body.name, req.body.password, req.body.email)
        res.render('success', {activity: 'Created'})
    }
})

app.get('/card', async function (req, res) {
    if (!req.session.cardID) {
        res.send('405 Not allowed - Session Expired')
    } else {
        const balance = await getBalance(req.session.cardID)
        const cardHolder = await getCardHolder(req.session.cardID)

        res.render('card', {cardID: req.session.cardID, balance: balance, cardHolder: cardHolder})
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

app.post('/card/delete', async function (req, res) {
    const balance = await getBalance(req.session.cardID)
    res.render('confirm-delete', {balance: balance})
})

app.get('/card/delete/confirm', async function (req, res) {
    if (await deactivateCard(req.session.cardID)) {
        res.render('success', {activity: 'Deleted'})
    } else {
        res.render('failed')
    }
})

// Start App

app.listen(port, function () {
    console.log('API is listening on port ' + port);
})
