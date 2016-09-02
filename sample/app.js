var express = require('express');
var app = express();

// static
app.use(express.static('public'));

// route
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, function() {
  console.log('server on port 3000.');
});