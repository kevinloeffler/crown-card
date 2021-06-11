import dotenv from 'dotenv'
import * as pg from 'pg'

const { Pool } = pg.default

dotenv.config()

// Database

const pool = new Pool ({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PW,
    port: 5432,
    ssl: { rejectUnauthorized: false }
})

pool.connect()

/* THIS WORKS!
const insertQuery = 'INSERT INTO Cards VALUES($1, $2, $3, $4, $5, $6)'
const insertValues = ['123123123', '100', 'true', 'Other Test', 'password', 'mail@mail.ch']

pool.query(insertQuery, insertValues, (err, res) => {
    if (err) {
        console.log(err.stack)
    } else {
        console.log(res.rows)
    }
})
*/

async function getAllCards () {
    const query = 'SELECT * from Cards'

    try {
        const res = await pool.query(query)
        console.log(res.rows)
    } catch (err) {
        console.log(err.stack)
    }
}

async function getCard (cardID) {
    const query = 'SELECT * from Cards where cardid = $1'
    const values = [cardID]

    try {
        const res = await pool.query(query, values)
        return res.rows
    } catch (err) {
        if (err.code === '22P02') {
            console.log('DB-ERROR: Invalid input type, expected integer')
        } else {
            console.log(err.stack)
        }
    }
}

async function updateCardBalance (cardID, newBalance) {
    const query = 'UPDATE Cards SET balance = $1 WHERE cardID = $2'
    const values = [newBalance, cardID]

    try {
        const res = await pool.query(query, values)
        return true;
    } catch (err) {
        if (err.code === '22P02') {
            console.log('DB-ERROR: Invalid input type, expected integer')
        } else {
            console.log(err.stack)
        }
        return false
    }
}



// Request logic

function authenticate (key) {
    if (key === process.env.AUTH_TOKEN) {
        console.log('Password Correct')
        return true
    }
    return false
}

async function validateCard (cardID) {
    const result = await getCard(cardID)

    if (Array.isArray(result) && result.length) {
        if (result[0].active) {
            console.log('Valid Card ID')
            return true
        }
    }
    console.log('Invalid Card ID')
    return false
}

async function getBalance (cardID) {
    const card = await getCard(cardID)
    return card[0].balance
}

async function chargeMoney (cardID, amount) {
    return await updateCardBalance(cardID, amount)
}

async function addMoney (cardID, amount) {
    return await updateCardBalance(cardID, amount)
}

export {authenticate, validateCard, getBalance, chargeMoney, addMoney}
