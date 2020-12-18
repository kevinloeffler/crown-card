// Create DB Object

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'znubloctxscnax',
  host: 'ec2-99-81-238-134.eu-west-1.compute.amazonaws.com',
  database: 'd2482mpt4j79fj',
  password: '81d91d6ee701445311cc08f5c4f4e83ca27c1e0246de3459ce5fa997d4d5cfd6',
  port: 5432,
});

// Queries

const getCards = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM cards ORDER BY cardID ASC', (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  })
}

const createCard = (body) => {
  return new Promise(function(resolve, reject) {
    const { name, email } = body
    pool.query('INSERT INTO merchants (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`A new merchant has been added added: ${results.rows[0]}`)
    })
  })
}

const deleteCard = () => {
  return new Promise(function(resolve, reject) {
    const id = parseInt(request.params.id)
    pool.query('DELETE FROM merchants WHERE id = $1', [id], (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(`Merchant deleted with ID: ${id}`)
    })
  })
}

module.exports = {
  getMerchants,
  createCard,
  deleteCard,
}
