import dotenv from 'dotenv'
import * as pg from 'pg'

const { Pool } = pg.default

dotenv.config()

// Database

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
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

async function activateCard (cardID, name, password = 'NULL', mail = 'NULL') {
    const query = "UPDATE Cards SET active = true, holder = $1, password = $2, email = $3 WHERE cardID = $4;"
    const values = [name, password, mail, cardID]

    try {
        const res = await pool.query(query, values)
        return true
    } catch (err) {
        console.log(err.stack)
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

/*
* Checks if a cardID is valid, returns
* -1 = Invalid
* 0 = Inactive
* 1 = Active
*/
async function validateCard (cardID) {
    const result = await getCard(cardID)

    if (Array.isArray(result) && result.length) {
        if (result[0].active) {
            console.log('Valid Card ID')
            return 1
        } else if (!result[0].active) {
            console.log('Valid, inactive Card ID')
            return 0
        }
    }
    console.log('Invalid Card ID')
    return -1
}

async function getBalance (cardID) {
    const card = await getCard(cardID)
    return card[0].balance
}

async function getCardHolder (cardID) {
    const card = await getCard(cardID)
    return card[0].holder
}

async function chargeMoney (cardID, amount) {
    return await updateCardBalance(cardID, amount)
}

async function addMoney (cardID, amount) {
    return await updateCardBalance(cardID, amount)
}

async function createNewCard (cardID, amount, name, password, email) {
    await activateCard(cardID, name, password, email)
    await updateCardBalance(cardID, amount)
}

export {authenticate, validateCard, getBalance, getCardHolder, chargeMoney, addMoney, createNewCard}
