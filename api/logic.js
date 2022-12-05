import dotenv from 'dotenv'
import * as pg from 'pg'

const { Pool } = pg.default

dotenv.config()

// Database

const pool = new Pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    //password: ''
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

pool.connect()

// Queries

async function getAllCards () {
    const query = 'SELECT * from Cards'

    try {
        await pool.query(query)
    } catch (err) {
    }
}

async function getCard (cardID) {
    const query = 'SELECT * from Cards where cardID = $1'
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
        await pool.query(query, values)
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
        await pool.query(query, values)
        return true
    } catch (err) {
        console.log(err.stack)
        return false
    }
}

async function deactivateCardDB (cardID) {
    const query = "UPDATE Cards SET active = false, balance = 0, holder = NULL, password = NULL, email = NULL WHERE cardID = $1;"
    const values = [cardID]

    try {
        await pool.query(query, values)
        return true
    } catch (err) {
        console.log(err.stack)
        return false
    }
}

async function getAllTransactionsDB (limit) {
    const query = 'SELECT * FROM log ORDER BY transactionid DESC LIMIT $1;'
    const values = [limit]

    try {
        const res = await pool.query(query, values)
        return res.rows
    } catch (err) {
        console.log(err.stack)
        return false
    }
}

async function getTotalBalanceDB () {
    const query = 'SELECT SUM(balance) FROM Cards;'

    try {
        const res = await pool.query(query)
        return res.rows[0].sum
    } catch (err) {
        console.log(err.stack)
        return false
    }
}

async function getCardCountDB () {
    const query = `SELECT t1.totalCards, t2.activeCards FROM ( SELECT COUNT(*) AS totalCards FROM Cards ) as t1 CROSS JOIN ( SELECT COUNT(*) AS activeCards FROM Cards WHERE active = 'true') as t2;`

    try {
        const res = await pool.query(query)
        return res.rows[0]
    } catch (err) {
        console.log(err.stack)
        return false
    }
}

async function log(account, action, amount = 0) {
    const query = `INSERT INTO log(account, action, amount, timestamp) VALUES($1, $2, $3, now());`
    const values = [account, action, amount]

    try {
        const res = await pool.query(query, values)
    } catch (err) {
        console.log(err.stack)
        return false
    }
}

// Request logic

function authenticate (key) {
    return key === process.env.AUTH_TOKEN
}

function adminAuthenticate (key) {
    return key === process.env.ADMIN_AUTH_TOKEN
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
            return 1
        } else if (!result[0].active) {
            return 0
        }
    }
    return -1
}

async function getCardDetails (cardID) {
    const card = await getCard(cardID)
    return card[0]
}

async function getBalance (cardID) {
    const card = await getCard(cardID)
    return card[0].balance
}

async function getCardHolder (cardID) {
    const card = await getCard(cardID)
    if (card[0].holder) {
        return card[0].holder
    } else {
        return '-'
    }
}

async function chargeMoney (cardID, amount, difference) {
    await log(cardID, 'Transaction', -difference)
    return await updateCardBalance(cardID, amount)
}

async function addMoney (cardID, amount, difference) {
    await log(cardID, 'Transaction', difference)
    return await updateCardBalance(cardID, amount)
}

async function createNewCard (cardID, amount, name, password, email) {
    await log(cardID, 'Create', amount)
    return await activateCard(cardID, name, password, email) &&
        await updateCardBalance(cardID, amount)
}

async function deactivateCard (cardID) {
    await log(cardID, 'Delete', 0)
    return await deactivateCardDB(cardID)
}

async function getAllTransactions (limit = 999) {
    return await getAllTransactionsDB(limit)
}

async function getTotalBalance () {
    return await getTotalBalanceDB()
}

async function getCardCount () {
    return await getCardCountDB()
}

export {authenticate, adminAuthenticate, validateCard, getCardDetails, getBalance, getCardHolder, chargeMoney, addMoney, createNewCard, deactivateCard, getAllTransactions, getTotalBalance, getCardCount}
