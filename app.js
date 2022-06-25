// Specify the Port to listen on
const port = process.env.PORT || 8080;

var express = require('express');
var path = require('path');
var createError = require('http-errors');
var session = require('express-session');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
// var expressLayouts = require('express-ejs-layouts');

//Setup External Files
var connection  = require('./lib/db');

var index = require('./routes/index');
var auth = require('./routes/auth');
var supervisors = require('./routes/supervisors');

const req = require('express/lib/request');
var app = express();


 
// Setup the Views Templating Engine
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'ejs');
 

 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(express.static(path.join(__dirname, 'public')));

// Includes the css files
 app.use(express.static('public'));
 app.use('/css', express.static(__dirname + 'public/css'))

 
 
 //Session Settings
 app.use(cookieParser());
 app.use(session({ 
     cookie: { maxAge: 86400000 },
     secret: 'secret code 3245',
     resave: false,
     saveUninitialized: true
 }))
 
 app.use(flash());
//  app.use(expressLayouts);

 app.use('/main', index);
 app.use('/', auth);
 app.use('/supervisor',supervisors)


 app.listen(port, () => console.log(`Listening on port ${port}..`));

 module.exports = app;