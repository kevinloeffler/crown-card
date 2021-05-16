const path = require('path')
const rootPath = path.dirname(__dirname)

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.sendFile('./app/index.html', {root: rootPath})
});

app.get('scripts/main.js',function(req,res){
    res.setHeader('content-type', 'text/javascript')
    res.sendFile('./app/scripts/main.js', {root: rootPath})
})


app.get('/page', function (req, res) {
    res.sendFile('./app/page.html', {root: rootPath})
});

app.listen(port, function () {
    console.log('API is listening on port ' + port);
});
