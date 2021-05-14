const express = require('express');
const app = express();

app.get('/', function (req, res) {
    console.log('request received')
    res.send('Hello World!');
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('myapp listening on port ' + port);
});
