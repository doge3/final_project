var express = require('express');
var dotenv = require('dotenv');
var pg = require('pg');
var qs = require('querystring');
var handlebars = require('express-handlebars');
var cookieParser = require('cookie-parser');
var http = require('http');
var path = require('path');
var sql = require('./sql');
var squel = require('squel');
var app = express();

dotenv.load();
var connStr = process.env.DELPHI_URL;

app.set('port', process.env.PORT || 3000);

app.engine('handlebars', handlebars({
    defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/education', function(req, res) {

    //This function call connects you to the database.
    pg.connect(connStr, function(err, client, done) {
        //Create your query string using SquelJS
        var queryStr = squel.select()
            .field("*")
            .from(sql.education).toString();
        var query = client.query(queryStr);

        //Access data from db one row at a time
        query.on('row', function(row, result) {
            result.addRow(row);
        });

        query.on('end', function(result) {
            //This line returns the connection back to the pool
            client.end();

            //return data as JSON
            res.json(result.rows);
        });
    });
});

app.get('/marital_status', function(req, res) {
    pg.connect(connStr, function(err, client, done) {
        var queryStr = squel.select()
            .field("*")
            .from(sql.marital_status).toString();
        var query = client.query(queryStr);

        query.on('row', function(row, result) {
            result.addRow(row);
        });

        query.on('end', function(result) {
            client.end();
            res.json(result.rows);
        });
    });
});

app.get('/poverty', function(req, res) {
    pg.connect(connStr, function(err, client, done) {
        var queryStr = squel.select()
            .field("*")
            .from(sql.poverty)
            .where("\"Region\" IS NOT NULL").toString();
        var query = client.query(queryStr);

        query.on('row', function(row, result) {
            result.addRow(row);
        });

        query.on('end', function(result) {
            client.end();
            res.json(result.rows);
        });
    });
});

app.get('/employment', function(req, res) {
    pg.connect(connStr, function(err, client, done) {
        var queryStr = squel.select()
            .field("*")
            .from(sql.employment).toString();
        var query = client.query(queryStr);

        query.on('row', function(row, result) {
            result.addRow(row);
        });

        query.on('end', function(result) {
            client.end();
            res.json({
                data: result.rows
            });
        });
    });
});


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});