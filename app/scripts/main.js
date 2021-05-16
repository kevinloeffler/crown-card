// Get ID from URL Parameter
let urlString = window.location.href
let url = new URL(urlString)
let ccID = url.searchParams.get('id')
console.log('ID: ' + ccID)

// Insert ID into Text Block
document.getElementById('id-text').innerHTML = 'ID: ' + ccID
