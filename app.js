var express = require('express');
var dotenv = require('dotenv');
var pg = require('pg');
var qs = require('querystring');
var handlebars = require('express-handlebars');
var cookieParser = require('cookie-parser');
var http = require('http');
var path = require('path');
var app = express();

dotenv.load();

var DELPHI_HOST = process.env.DELPHI_HOST;
var DELPHI_PORT = process.env.DELPHI_PORT;
var DELPHI_USERNAME = process.env.DELPHI_USERNAME;
var DELPHI_PASSWORD = process.env.DELPHI_PASSWORD;
var DELPHI_DB = process.env.DELPHI_DB;

var connStr = 'pg://' + DELPHI_USERNAME + ':' + encodeURIComponent(DELPHI_PASSWORD) + '@' + DELPHI_HOST + ':' + DELPHI_PORT + '/' + DELPHI_DB;

// var client = new pg.Client(connStr);
// client.connect();

app.set('port', process.env.PORT || 3000);

app.engine('handlebars', handlebars({
    defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded({
//     extended: false
// }));
// app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', function(req, res) {
    res.render('index');
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});