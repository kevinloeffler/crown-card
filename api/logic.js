function authenticate (key) {
    if (key === process.env.AUTH_TOKEN) {
        console.log('Login successful')
        return true
    }
    console.log('Login denied')
    return false
}

function validateCard (cardID) {
    // ToDo: check if card is valid
    console.log('Valid Card ID')
    return true
}

function chargeMoney (amount) {
    //ToDo: Check if amount is integer
    //ToDo: Check if chard has enough money
    //ToDo: Server Request
    return true
}

function addMoney (amount) {
    //ToDo: Add money to card
    //ToDo: Server Request
}

export {authenticate, validateCard, chargeMoney, addMoney}
