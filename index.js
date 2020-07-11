var express = require('express');
var app = express();
var http = require('http').createServer(app);


app.use(express.static(__dirname + "/public"));

app.engine('html', require('ejs').renderFile)
   .set('views', __dirname + '/public')
   .set('view engine', 'html');

app.get('/', (req, res) => {
  res.render('index');
});

require('./groups.js')(http);

http.listen(3000, () => {
  console.log('listening on *:3000');
});
